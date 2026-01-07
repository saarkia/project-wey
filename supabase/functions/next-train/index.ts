import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

type CallingPoint = {
  crs?: string;
  st?: string;
  et?: string;
  at?: string;
};

type ServiceSummary = {
  serviceId?: string;
  std?: string;
  etd?: string;
  platform?: string;
  operator?: string;
  scheduledArrival?: string;
  expectedArrival?: string;
  actualArrival?: string;
  scheduledDurationMins?: number | null;
  isCancelled?: boolean;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseNumber = (value: unknown, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return fallback;
};

const isValidTime = (value?: string) => Boolean(value && /^\d{1,2}:\d{2}$/.test(value));

const parseTimeToMinutes = (value?: string) => {
  if (!value || !isValidTime(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const diffMinutes = (start?: string, end?: string) => {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  if (startMinutes === null || endMinutes === null) return null;
  let diff = endMinutes - startMinutes;
  if (diff < 0) diff += 24 * 60;
  return diff;
};

const toArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const findCallingPoint = (callingPointLists: unknown, destination: string): CallingPoint | null => {
  const lists = toArray(callingPointLists as { callingPoint?: CallingPoint | CallingPoint[] }[]);

  for (const list of lists) {
    const callingPoints = toArray(list?.callingPoint as CallingPoint | CallingPoint[]);
    const match = callingPoints.find((point) => point?.crs === destination);
    if (match) return match;
  }

  return null;
};

const getServices = (payload: Record<string, unknown>) => {
  const root = payload?.GetStationBoardResult as Record<string, unknown> | undefined;
  const services = (root?.trainServices as Record<string, unknown> | undefined)?.service
    ?? (payload?.trainServices as Record<string, unknown> | undefined)?.service;

  return toArray(services as Record<string, unknown> | Record<string, unknown>[]);
};

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('RAILDATA_X_APIKEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing rail data API key.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    let bodyParams: Record<string, unknown> = {};
    if (request.method === 'POST') {
      try {
        bodyParams = await request.json();
      } catch (error) {
        console.warn('Unable to parse JSON body', error);
      }
    }

    const getParam = (key: string) => bodyParams[key] ?? url.searchParams.get(key);

    const origin = String(getParam('origin') ?? 'WYB').toUpperCase();
    const destination = String(getParam('destination') ?? 'WAT').toUpperCase();

    const maxDurationMins = clamp(parseNumber(getParam('maxDurationMins'), 40), 10, 180);
    const timeWindowMins = clamp(parseNumber(getParam('timeWindowMins'), 120), 10, 360);
    const numRows = clamp(parseNumber(getParam('numRows'), 9), 1, 9);
    const timeOffset = clamp(parseNumber(getParam('timeOffset'), 0), 0, 720);

    const endpoint = `https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepBoardWithDetails/${origin}`;
    const params = new URLSearchParams({
      numRows: String(numRows),
      filterCrs: destination,
      filterType: 'to',
      timeOffset: String(timeOffset),
      timeWindow: String(timeWindowMins)
    });

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        error: 'Rail data request failed.',
        status: response.status,
        detail: errorText
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await response.json();
    const services = getServices(payload);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const mapped = services.map((service) => {
      const std = service?.std as string | undefined;
      const etd = service?.etd as string | undefined;
      const platform = service?.platform as string | undefined;
      const operator = (service?.operator as string | undefined) ?? (service?.operatorCode as string | undefined);
      const callingPoint = findCallingPoint(
        service?.subsequentCallingPoints,
        destination
      );
      const scheduledArrival = callingPoint?.st;
      const expectedArrival = callingPoint?.et ?? callingPoint?.at;
      const actualArrival = callingPoint?.at;
      const scheduledDurationMins = diffMinutes(std, scheduledArrival);
      const serviceId = service?.serviceID as string | undefined;
      const isCancelled = Boolean(service?.isCancelled ?? service?.cancelled);

      const departureMinutes = parseTimeToMinutes(std);
      const relativeDepartureMinutes = departureMinutes !== null
        ? (departureMinutes < nowMinutes - 1 ? departureMinutes + 24 * 60 : departureMinutes)
        : null;

      return {
        serviceId,
        std,
        etd,
        platform,
        operator,
        scheduledArrival,
        expectedArrival,
        actualArrival,
        scheduledDurationMins,
        isCancelled,
        relativeDepartureMinutes
      };
    });

    const eligible = mapped
      .filter((service) => service.scheduledDurationMins !== null && service.scheduledDurationMins <= maxDurationMins)
      .filter((service) => service.relativeDepartureMinutes !== null)
      .sort((a, b) => (a.relativeDepartureMinutes ?? 0) - (b.relativeDepartureMinutes ?? 0));

    const [next, ...rest] = eligible;

    const result = {
      origin,
      destination,
      maxDurationMins,
      timeWindowMins,
      generatedAt: new Date().toISOString(),
      next: (next ? {
        serviceId: next.serviceId,
        std: next.std,
        etd: next.etd,
        platform: next.platform,
        operator: next.operator,
        scheduledArrival: next.scheduledArrival,
        expectedArrival: next.expectedArrival,
        actualArrival: next.actualArrival,
        scheduledDurationMins: next.scheduledDurationMins,
        isCancelled: next.isCancelled
      } : null) as ServiceSummary | null,
      alternatives: rest.map((service) => ({
        serviceId: service.serviceId,
        std: service.std,
        etd: service.etd,
        platform: service.platform,
        operator: service.operator,
        scheduledArrival: service.scheduledArrival,
        expectedArrival: service.expectedArrival,
        actualArrival: service.actualArrival,
        scheduledDurationMins: service.scheduledDurationMins,
        isCancelled: service.isCancelled
      })) as ServiceSummary[],
      note: eligible.length === 0 ? 'No services matched the duration filter.' : null
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Unexpected error', error);
    return new Response(JSON.stringify({ error: 'Unexpected server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
