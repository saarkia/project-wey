-- ByTheWey Forum Seed Data
-- Run this in your Supabase SQL Editor to populate the forum with initial threads

-- First, create user profiles for all the forum participants
-- Note: These are dummy profiles. In production, users would be created through auth.
INSERT INTO profiles (id, username, avatar_url, role, created_at) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'andy1978', null, 'user', '2025-12-01 10:00:00'),
  ('a2222222-2222-2222-2222-222222222222', 'KT13Mum', null, 'user', '2025-12-01 10:00:00'),
  ('a3333333-3333-3333-3333-333333333333', 'Jezza84', null, 'user', '2025-12-01 10:00:00'),
  ('a4444444-4444-4444-4444-444444444444', 'sarahl', null, 'user', '2025-12-01 10:00:00'),
  ('a5555555-5555-5555-5555-555555555555', 'michellek', null, 'user', '2025-12-01 10:00:00'),
  ('a6666666-6666-6666-6666-666666666666', 'daveKT13', null, 'user', '2025-12-01 10:00:00'),
  ('a7777777-7777-7777-7777-777777777777', 'tomw', null, 'user', '2025-12-01 10:00:00'),
  ('a8888888-8888-8888-8888-888888888888', 'BevB', null, 'user', '2025-12-01 10:00:00'),
  ('a9999999-9999-9999-9999-999999999999', 'NinaS', null, 'user', '2025-12-01 10:00:00'),
  ('b1111111-1111-1111-1111-111111111111', 'mattp', null, 'user', '2025-12-01 10:00:00'),
  ('b2222222-2222-2222-2222-222222222222', 'SnoozySue', null, 'user', '2025-12-01 10:00:00'),
  ('b3333333-3333-3333-3333-333333333333', 'CommuterKev', null, 'user', '2025-12-01 10:00:00'),
  ('b4444444-4444-4444-4444-444444444444', 'LouP', null, 'user', '2025-12-01 10:00:00'),
  ('b5555555-5555-5555-5555-555555555555', 'OldWey', null, 'user', '2025-12-01 10:00:00'),
  ('b6666666-6666-6666-6666-666666666666', 'bexxo', null, 'user', '2025-12-01 10:00:00'),
  ('b7777777-7777-7777-7777-777777777777', 'cazp', null, 'user', '2025-12-01 10:00:00'),
  ('b8888888-8888-8888-8888-888888888888', 'DIYdan', null, 'user', '2025-12-01 10:00:00'),
  ('b9999999-9999-9999-9999-999999999999', 'FixItFelix', null, 'user', '2025-12-01 10:00:00'),
  ('c1111111-1111-1111-1111-111111111111', 'brooklandsboy', null, 'user', '2025-12-01 10:00:00'),
  ('c2222222-2222-2222-2222-222222222222', 'RoastScout', null, 'user', '2025-12-01 10:00:00'),
  ('c3333333-3333-3333-3333-333333333333', 'PramPatrol', null, 'user', '2025-12-01 10:00:00'),
  ('c4444444-4444-4444-4444-444444444444', 'LostKeys23', null, 'user', '2025-12-01 10:00:00'),
  ('c5555555-5555-5555-5555-555555555555', 'GiftPanic', null, 'user', '2025-12-01 10:00:00'),
  ('c6666666-6666-6666-6666-666666666666', 'Queueing', null, 'user', '2025-12-01 10:00:00'),
  ('c7777777-7777-7777-7777-777777777777', 'QuietXmas', null, 'user', '2025-12-01 10:00:00'),
  ('c8888888-8888-8888-8888-888888888888', 'BoxingDayBlues', null, 'user', '2025-12-01 10:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert forum threads
INSERT INTO forum_threads (id, board, title, content, author_id, author_username, created_at) VALUES
  -- Thread 1: River Wey path
  ('t1111111-1111-1111-1111-111111111111',
   'Town Talk',
   'River Wey path - muddy nightmare?',
   'Is the River Wey path meant to be this muddy every winter? Took the dog down by Thames St and honestly it was like walking through chocolate mousse. Any decent route thats not a slip n slide?',
   'a1111111-1111-1111-1111-111111111111',
   'andy1978',
   '2025-12-13 09:15:00'),

  -- Thread 2: Parking
  ('t2222222-2222-2222-2222-222222222222',
   'Town Talk',
   'Parking til 7pm now?!',
   'Parking in town is doing my head in. Are the car parks really charging til 7 now? I swear it used to be 6. Got paranoid every time i leave the car now.',
   'a5555555-5555-5555-5555-555555555555',
   'michellek',
   '2025-12-14 10:30:00'),

  -- Thread 3: Station commuting
  ('t3333333-3333-3333-3333-333333333333',
   'Town Talk',
   'Weybridge station = chaos',
   'Anyone else commuting from Weybridge station and just sick of the random cancellations? This morning was a shambles. Also where do you park if you get there after 8? asking for a friend (me).',
   'a9999999-9999-9999-9999-999999999999',
   'NinaS',
   '2025-12-15 08:45:00'),

  -- Thread 4: Moving to Weybridge
  ('t4444444-4444-4444-4444-444444444444',
   'Town Talk',
   'New to Weybridge - what to do?',
   'Moving to Weybridge in Jan (Queens Rd side). What do people actually DO here? We dont have kids yet. Any clubs/classes/whatever, or is it just pubs and private gyms lol',
   'b4444444-4444-4444-4444-444444444444',
   'LouP',
   '2025-12-16 14:20:00'),

  -- Thread 5: Lunch spots
  ('t5555555-5555-5555-5555-555555555555',
   'Recommendations',
   'Quick lunch spots?',
   'Any good lunch spots in town that dont take forever? Need somewhere I can actually eat and be back in 30-40 mins. Sick of sad meal deals.',
   'b6666666-6666-6666-6666-666666666666',
   'bexxo',
   '2025-12-17 11:00:00'),

  -- Thread 6: Electrician
  ('t6666666-6666-6666-6666-666666666666',
   'Recommendations',
   'Reliable electrician needed',
   'Need an electrician in Weybridge. Not the cheapest, just someone who actually turns up and doesnt vanish after quoting. Any recs?',
   'b8888888-8888-8888-8888-888888888888',
   'DIYdan',
   '2025-12-18 16:30:00'),

  -- Thread 7: Brooklands noise
  ('t7777777-7777-7777-7777-777777777777',
   'Town Talk',
   'Brooklands engine noise?',
   'Can you lot hear Brooklands sometimes or am I imagining it? Faint engine noise in the distance, mostly weekends. Not moaning just curious.',
   'c1111111-1111-1111-1111-111111111111',
   'brooklandsboy',
   '2025-12-19 13:10:00'),

  -- Thread 8: Sunday roast
  ('t8888888-8888-8888-8888-888888888888',
   'Recommendations',
   'Sunday roast verdict: Old Crown vs Minnow',
   'Sunday roast in Weybridge. Old Crown vs Minnow. Need a verdict before my family group chat starts a civil war. Who wins?',
   'c2222222-2222-2222-2222-222222222222',
   'RoastScout',
   '2025-12-20 10:45:00'),

  -- Thread 9: Pram friendly cafes
  ('t9999999-9999-9999-9999-999999999999',
   'Recommendations',
   'Pram friendly coffee spots?',
   'Pram friendly coffee spots in Weybridge where you dont feel like you're blocking the whole place? Midweek ideally. I cant deal with the judgement 😂',
   'c3333333-3333-3333-3333-333333333333',
   'PramPatrol',
   '2025-12-21 09:30:00'),

  -- Thread 10: Lost keys
  ('ta111111-1111-1111-1111-111111111111',
   'Town Talk',
   'Lost keys near Monument Green',
   'Long shot. Anyone find keys near Monument Green / by the river path yesterday? Black fob, couple keys, little silver tag. Ive checked pockets 100 times 😩',
   'c4444444-4444-4444-4444-444444444444',
   'LostKeys23',
   '2025-12-22 08:20:00'),

  -- Thread 11: Gift ideas
  ('ta222222-2222-2222-2222-222222222222',
   'Recommendations',
   'Last minute gift ideas',
   'Ok ive left it too late. Need a small gift from Weybridge today. Not a candle. Any ideas?',
   'c5555555-5555-5555-5555-555555555555',
   'GiftPanic',
   '2025-12-23 15:00:00'),

  -- Thread 12: Traffic
  ('ta333333-3333-3333-3333-333333333333',
   'Town Talk',
   'Town centre gridlock today',
   'Town centre is MAD today. Church Street was gridlocked and someone tried to do a 17 point turn while everyone watched. If you're driving in, good luck.',
   'c6666666-6666-6666-6666-666666666666',
   'Queueing',
   '2025-12-24 11:30:00'),

  -- Thread 13: Christmas walk
  ('ta444444-4444-4444-4444-444444444444',
   'Town Talk',
   'River walk on Christmas Day',
   'Merry xmas all. Is the river walk any better today or still pure mud? Need to escape the house after lunch lol',
   'c7777777-7777-7777-7777-777777777777',
   'QuietXmas',
   '2025-12-25 13:00:00'),

  -- Thread 14: Boxing Day shops
  ('ta555555-5555-5555-5555-555555555555',
   'Town Talk',
   'Shops open Boxing Day?',
   'Any shops open today in Weybridge for basics? Batteries specifically. I refuse to pay petrol station prices out of spite.',
   'c8888888-8888-8888-8888-888888888888',
   'BoxingDayBlues',
   '2025-12-26 10:00:00');

-- Insert replies
INSERT INTO forum_replies (thread_id, content, author_id, author_username, created_at) VALUES
  -- Replies to Thread 1 (River path)
  ('t1111111-1111-1111-1111-111111111111', 'Yep every year. Its worse after rain obviously. I stick to the bits nearer town then turn back before it gets grim.', 'a2222222-2222-2222-2222-222222222222', 'KT13Mum', '2025-12-13 10:30:00'),
  ('t1111111-1111-1111-1111-111111111111', 'Decathlon boots. Not sexy but they work. Also watch the dog, mine came back looking like a swamp creature.', 'a3333333-3333-3333-3333-333333333333', 'Jezza84', '2025-12-13 11:45:00'),
  ('t1111111-1111-1111-1111-111111111111', 'If you want a cleaner walk do a loop round Monument Green and down the nicer stretch. Still muddy but less "lose your shoe" mud.', 'a4444444-4444-4444-4444-444444444444', 'sarahl', '2025-12-14 08:20:00'),

  -- Replies to Thread 2 (Parking)
  ('t2222222-2222-2222-2222-222222222222', 'Baker St car park is 8am-7pm Mon-Sat. Signs say it but loads of ppl dont notice til its too late.', 'a6666666-6666-6666-6666-666666666666', 'daveKT13', '2025-12-14 11:00:00'),
  ('t2222222-2222-2222-2222-222222222222', 'Take a photo of the sign. Sounds OTT but its saved me when I couldnt remember what I paid for.', 'a7777777-7777-7777-7777-777777777777', 'tomw', '2025-12-14 14:15:00'),
  ('t2222222-2222-2222-2222-222222222222', 'I got a ticket once for being a few mins over, never again. I set an alarm now like im on probation.', 'a8888888-8888-8888-8888-888888888888', 'BevB', '2025-12-15 09:30:00'),

  -- Replies to Thread 3 (Station)
  ('t3333333-3333-3333-3333-333333333333', 'After 8 youre basically gambling. I go 7:20ish if I need a space. If im late I park further out and walk in.', 'b1111111-1111-1111-1111-111111111111', 'mattp', '2025-12-15 09:30:00'),
  ('t3333333-3333-3333-3333-333333333333', 'The worst is when they cancel then the next one is rammed so you stand there like a sardine. Love that for us.', 'b2222222-2222-2222-2222-222222222222', 'SnoozySue', '2025-12-15 10:15:00'),
  ('t3333333-3333-3333-3333-333333333333', 'Sometimes i drive to another station if its totally broken but thats also stressful. Wish buses were better round here tbh.', 'b3333333-3333-3333-3333-333333333333', 'CommuterKev', '2025-12-16 07:45:00'),

  -- Replies to Thread 4 (Moving to Weybridge)
  ('t4444444-4444-4444-4444-444444444444', 'Welcome. Its a bit "make your own fun" but there is stuff. Running groups, tennis, river walks. Brooklands museum is good too even if you're not a car person.', 'b5555555-5555-5555-5555-555555555555', 'OldWey', '2025-12-16 15:00:00'),
  ('t4444444-4444-4444-4444-444444444444', 'Honestly once you become a regular somewhere you start seeing the same faces. Sounds daft but it works.', 'a2222222-2222-2222-2222-222222222222', 'KT13Mum', '2025-12-16 16:20:00'),
  ('t4444444-4444-4444-4444-444444444444', 'Traffic is the main hobby 😂 You'll get used to timing everything around school run.', 'a3333333-3333-3333-3333-333333333333', 'Jezza84', '2025-12-17 09:00:00'),

  -- Replies to Thread 5 (Lunch spots)
  ('t5555555-5555-5555-5555-555555555555', 'Aromas is quick if you dont hit the lunch rush. If its rammed youll be waiting.', 'b7777777-7777-7777-7777-777777777777', 'cazp', '2025-12-17 11:30:00'),
  ('t5555555-5555-5555-5555-555555555555', 'Soya is decent for lunch but again depends how busy. Takeaway is quicker.', 'b1111111-1111-1111-1111-111111111111', 'mattp', '2025-12-17 12:15:00'),
  ('t5555555-5555-5555-5555-555555555555', 'Baker Street Coffee House does alright sandwiches. Not fancy but reliable.', 'a1111111-1111-1111-1111-111111111111', 'andy1978', '2025-12-18 09:00:00'),

  -- Replies to Thread 6 (Electrician)
  ('t6666666-6666-6666-6666-666666666666', 'Following. Had 2 no-shows this month. One texted me at 9pm like "u around tomorrow" mate no.', 'b9999999-9999-9999-9999-999999999999', 'FixItFelix', '2025-12-18 17:00:00'),
  ('t6666666-6666-6666-6666-666666666666', 'Ask your neighbours on your road, genuinely. The good ones are word of mouth round here.', 'a7777777-7777-7777-7777-777777777777', 'tomw', '2025-12-18 18:30:00'),
  ('t6666666-6666-6666-6666-666666666666', 'When we moved last time we found someone via a local WhatsApp group. Painful but it worked.', 'b4444444-4444-4444-4444-444444444444', 'LouP', '2025-12-19 10:00:00'),

  -- Replies to Thread 7 (Brooklands noise)
  ('t7777777-7777-7777-7777-777777777777', 'Yep depends on wind. Some days its loud-ish, other days nothing.', 'a4444444-4444-4444-4444-444444444444', 'sarahl', '2025-12-19 14:00:00'),
  ('t7777777-7777-7777-7777-777777777777', 'I kinda like it. Better than leaf blowers at 8am.', 'a3333333-3333-3333-3333-333333333333', 'Jezza84', '2025-12-19 15:30:00'),
  ('t7777777-7777-7777-7777-777777777777', 'If youre near Heath Rd you can def hear it sometimes.', 'b5555555-5555-5555-5555-555555555555', 'OldWey', '2025-12-20 09:00:00'),

  -- Replies to Thread 8 (Sunday roast)
  ('t8888888-8888-8888-8888-888888888888', 'Old Crown if you want proper pub roast. Minnow is more gastropub vibes and you pay for it.', 'a1111111-1111-1111-1111-111111111111', 'andy1978', '2025-12-20 11:15:00'),
  ('t8888888-8888-8888-8888-888888888888', 'Minnow is good but BOOK. Turning up and hoping is how you end up eating crisps at 4pm.', 'a6666666-6666-6666-6666-666666666666', 'daveKT13', '2025-12-20 12:00:00'),
  ('t8888888-8888-8888-8888-888888888888', 'Old Crown gravy is elite. Thats my entire review.', 'a8888888-8888-8888-8888-888888888888', 'BevB', '2025-12-21 10:30:00'),

  -- Replies to Thread 9 (Pram friendly)
  ('t9999999-9999-9999-9999-999999999999', 'Aromas is fine midweek. Weekends are chaos, dont bother.', 'a2222222-2222-2222-2222-222222222222', 'KT13Mum', '2025-12-21 10:00:00'),
  ('t9999999-9999-9999-9999-999999999999', 'Baker Street Coffee House has a bit more room if you go early. After 11 it gets busy.', 'a5555555-5555-5555-5555-555555555555', 'michellek', '2025-12-21 11:30:00'),
  ('t9999999-9999-9999-9999-999999999999', 'Also Piccolo Play is great if you just need to sit down and not apologise for existing.', 'a9999999-9999-9999-9999-999999999999', 'NinaS', '2025-12-22 09:00:00'),

  -- Replies to Thread 10 (Lost keys)
  ('ta111111-1111-1111-1111-111111111111', 'Try asking in the Minnow, people hand stuff in there. Also the benches by the bridge sometimes have "found" things left on them.', 'a4444444-4444-4444-4444-444444444444', 'sarahl', '2025-12-22 09:00:00'),
  ('ta111111-1111-1111-1111-111111111111', 'Post in the local FB group as well. Hate recommending FB but lost stuff gets found weirdly fast on there.', 'b1111111-1111-1111-1111-111111111111', 'mattp', '2025-12-22 10:30:00'),
  ('ta111111-1111-1111-1111-111111111111', 'Cheers all. No luck yet. Going to check the pub again later.', 'c4444444-4444-4444-4444-444444444444', 'LostKeys23', '2025-12-23 14:00:00'),

  -- Replies to Thread 11 (Gifts)
  ('ta222222-2222-2222-2222-222222222222', 'Bachmanns chocs. Easy win.', 'b6666666-6666-6666-6666-666666666666', 'bexxo', '2025-12-23 15:20:00'),
  ('ta222222-2222-2222-2222-222222222222', 'Coffee beans from a local cafe if they're into coffee. Or nice tea, but thats harder to find.', 'a7777777-7777-7777-7777-777777777777', 'tomw', '2025-12-23 15:45:00'),
  ('ta222222-2222-2222-2222-222222222222', 'Bachmanns is dangerous though. Youll buy "one box" then suddenly youve spent 30 quid.', 'a8888888-8888-8888-8888-888888888888', 'BevB', '2025-12-23 16:30:00'),

  -- Replies to Thread 12 (Traffic)
  ('ta333333-3333-3333-3333-333333333333', 'Morrisons car park earlier was bumper cars. Took me longer to park than to shop.', 'a1111111-1111-1111-1111-111111111111', 'andy1978', '2025-12-24 12:00:00'),
  ('ta333333-3333-3333-3333-333333333333', 'People act like walking 5 mins is illegal. Park slightly further out, save yourself.', 'b2222222-2222-2222-2222-222222222222', 'SnoozySue', '2025-12-24 13:15:00'),

  -- Replies to Thread 13 (Christmas walk)
  ('ta444444-4444-4444-4444-444444444444', 'Still muddy in bits. Fine if you've got decent shoes. Saw someone in white trainers making choices.', 'c1111111-1111-1111-1111-111111111111', 'brooklandsboy', '2025-12-25 14:00:00'),
  ('ta444444-4444-4444-4444-444444444444', 'We did the cleaner stretch then turned back before it got gross. Kids were happy, pram survived.', 'c3333333-3333-3333-3333-333333333333', 'PramPatrol', '2025-12-25 15:30:00'),

  -- Replies to Thread 14 (Boxing Day)
  ('ta555555-5555-5555-5555-555555555555', 'Supermarkets usually have AA/AAA. If its some weird battery then yeah youre cursed.', 'a6666666-6666-6666-6666-666666666666', 'daveKT13', '2025-12-26 10:30:00'),
  ('ta555555-5555-5555-5555-555555555555', 'If you go into town just check parking signs, dont get a Boxing Day ticket on top of everything else.', 'a5555555-5555-5555-5555-555555555555', 'michellek', '2025-12-26 11:00:00'),
  ('ta555555-5555-5555-5555-555555555555', 'Let us know if you find somewhere open because I need them too 🙃', 'a9999999-9999-9999-9999-999999999999', 'NinaS', '2025-12-26 11:45:00');

-- Verify the data was inserted
SELECT
  (SELECT COUNT(*) FROM profiles WHERE username IN ('andy1978', 'KT13Mum', 'Jezza84')) as profiles_count,
  (SELECT COUNT(*) FROM forum_threads) as threads_count,
  (SELECT COUNT(*) FROM forum_replies) as replies_count;
