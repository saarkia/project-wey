import React from 'react';

export default function Styleguide() {
  return (
    <div className="min-h-screen bg-surface-base">
      <div className="max-w-4xl mx-auto p-4 pb-16 space-y-12">

        {/* Header */}
        <header className="py-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            ByTheWey Design System
          </h1>
          <p className="text-text-secondary">
            Design tokens and component examples for the ByTheWey platform
          </p>
        </header>

        {/* Brand Colors */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Brand Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorSwatch
              name="Primary"
              variable="--brand-primary"
              value="#0F5E59"
              className="bg-brand-primary"
            />
            <ColorSwatch
              name="Accent"
              variable="--brand-accent"
              value="#9FD3D0"
              className="bg-brand-accent"
            />
          </div>
        </section>

        {/* Surface Colors */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Surface Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorSwatch
              name="Base"
              variable="--surface-base"
              value="#F7F4EF"
              className="bg-surface-base border border-border-subtle"
            />
            <ColorSwatch
              name="Card"
              variable="--surface-card"
              value="#FFFEFC"
              className="bg-surface-card border border-border-subtle"
            />
            <ColorSwatch
              name="Muted"
              variable="--surface-muted"
              value="#EFEAE2"
              className="bg-surface-muted border border-border-subtle"
            />
          </div>
        </section>

        {/* Text Colors */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Text Colors</h2>
          <div className="bg-surface-card p-6 rounded-xl border border-border-subtle space-y-3">
            <div className="text-text-primary text-lg font-bold">
              Primary Text (text-text-primary)
            </div>
            <div className="text-text-secondary">
              Secondary Text (text-text-secondary)
            </div>
            <div className="text-text-muted text-sm">
              Muted Text (text-text-muted)
            </div>
            <div className="bg-brand-primary p-3 rounded-lg">
              <span className="text-text-inverse">
                Inverse Text on dark background (text-text-inverse)
              </span>
            </div>
          </div>
        </section>

        {/* Border Examples */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Borders & Focus</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-card p-6 rounded-xl border-2 border-border-subtle">
              <p className="text-text-secondary text-sm font-medium">Subtle Border</p>
              <p className="text-text-muted text-xs mt-1">border-border-subtle</p>
            </div>
            <div className="bg-surface-card p-6 rounded-xl border-2 border-border-strong">
              <p className="text-text-secondary text-sm font-medium">Strong Border</p>
              <p className="text-text-muted text-xs mt-1">border-border-strong</p>
            </div>
          </div>
          <div className="mt-4 bg-surface-card p-6 rounded-xl border-2 border-transparent ring-2 ring-focus-ring">
            <p className="text-text-secondary text-sm font-medium">Focus Ring Example</p>
            <p className="text-text-muted text-xs mt-1">ring-focus-ring</p>
          </div>
        </section>

        {/* Category Tints */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Category Tints</h2>
          <p className="text-text-secondary text-sm mb-4">
            Background colors for category indicators
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <CategoryTint name="Coffee" className="bg-category-coffee" />
            <CategoryTint name="Pubs" className="bg-category-pubs" />
            <CategoryTint name="Kids" className="bg-category-kids" />
            <CategoryTint name="Culture" className="bg-category-culture" />
            <CategoryTint name="Shopping" className="bg-category-shopping" />
          </div>
        </section>

        {/* Example UI Components */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-4">UI Component Examples</h2>

          {/* Card Example */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Card</h3>
              <div className="bg-surface-card rounded-xl border border-border-subtle p-6 shadow-sm">
                <h4 className="text-text-primary font-bold text-lg mb-2">Card Title</h4>
                <p className="text-text-secondary text-sm mb-4">
                  This is an example card using the surface-card background with subtle borders.
                </p>
                <div className="flex gap-2">
                  <span className="bg-category-coffee px-3 py-1 rounded-full text-xs font-medium text-text-primary">
                    Coffee
                  </span>
                  <span className="bg-category-culture px-3 py-1 rounded-full text-xs font-medium text-text-primary">
                    Culture
                  </span>
                </div>
              </div>
            </div>

            {/* Chip Examples */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Chips</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-surface-muted px-3 py-1.5 rounded-full text-xs font-medium text-text-primary">
                  Default Chip
                </span>
                <span className="bg-brand-primary text-text-inverse px-3 py-1.5 rounded-full text-xs font-medium">
                  Primary Chip
                </span>
                <span className="bg-brand-accent px-3 py-1.5 rounded-full text-xs font-medium text-text-primary">
                  Accent Chip
                </span>
              </div>
            </div>

            {/* Button Examples */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <button className="bg-brand-primary text-text-inverse px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Primary Button
                </button>
                <button className="bg-surface-card text-text-primary px-6 py-3 rounded-lg font-medium border border-border-strong hover:bg-surface-muted transition-colors">
                  Secondary Button
                </button>
                <button className="bg-brand-accent text-text-primary px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Accent Button
                </button>
              </div>
            </div>

            {/* Section Header */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Section Header</h3>
              <div className="bg-surface-card rounded-xl border border-border-subtle p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-text-primary">Featured Locations</h4>
                    <p className="text-text-muted text-sm mt-1">
                      Discover the best spots in Weybridge
                    </p>
                  </div>
                  <button className="text-brand-primary text-sm font-medium hover:text-brand-accent transition-colors">
                    View All →
                  </button>
                </div>
                <div className="h-px bg-border-subtle"></div>
              </div>
            </div>

            {/* Input Example */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Input Field</h3>
              <input
                type="text"
                placeholder="Enter your text..."
                className="w-full bg-surface-card border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring transition-shadow"
              />
            </div>

            {/* Category Banner */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3">Category Banners</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-category-coffee rounded-lg p-4 border border-border-subtle">
                  <p className="font-bold text-text-primary text-sm">Coffee & Cafés</p>
                  <p className="text-text-muted text-xs mt-1">Local coffee shops</p>
                </div>
                <div className="bg-category-pubs rounded-lg p-4 border border-border-subtle">
                  <p className="font-bold text-text-primary text-sm">Pubs & Dining</p>
                  <p className="text-text-muted text-xs mt-1">Food and drink venues</p>
                </div>
                <div className="bg-category-kids rounded-lg p-4 border border-border-subtle">
                  <p className="font-bold text-text-primary text-sm">Kids & Family</p>
                  <p className="text-text-muted text-xs mt-1">Family-friendly activities</p>
                </div>
                <div className="bg-category-culture rounded-lg p-4 border border-border-subtle">
                  <p className="font-bold text-text-primary text-sm">Arts & Culture</p>
                  <p className="text-text-muted text-xs mt-1">Museums, galleries, events</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border-subtle">
          <p className="text-text-muted text-sm text-center">
            ByTheWey Design System - Option C Palette
          </p>
        </footer>
      </div>
    </div>
  );
}

// Helper Components
function ColorSwatch({ name, variable, value, className }) {
  return (
    <div className="space-y-2">
      <div className={`h-24 rounded-lg ${className}`}></div>
      <div>
        <p className="font-bold text-text-primary text-sm">{name}</p>
        <p className="text-text-muted text-xs font-mono">{variable}</p>
        <p className="text-text-muted text-xs">{value}</p>
      </div>
    </div>
  );
}

function CategoryTint({ name, className }) {
  return (
    <div className={`${className} rounded-lg p-4 border border-border-subtle`}>
      <p className="font-medium text-text-primary text-sm">{name}</p>
    </div>
  );
}
