# Platform Strategy

Date: 2026-04-01

## Recommendation

Do not make HostLens a mobile-app-only product.

Make the web app the primary product surface:

- marketing site
- signup and login
- billing
- device onboarding
- device claim flow
- alert rule setup
- history and dashboard review

Make mobile a companion app in phase 2:

- push alerts
- quick device status
- acknowledge / mute alerts
- simple health snapshot
- emergency actions

Do not force first-time users to download a mobile app in order to use the product.

## Why this is the right choice

### 1. The product job is desktop-first

HostLens is centered on monitoring laptops, desktops, and small fleets through an agent. The setup loop is naturally:

1. create account
2. download or configure the agent
3. claim the device
4. inspect the dashboard
5. tune alerts

That workflow is much better on the web than in a mobile app.

### 2. Current category leaders use web as the control plane

- Datadog's official mobile docs say dashboards and monitors can be viewed on mobile, but setup and editing still require the browser app.
- Better Stack's official mobile docs position the mobile app around incident notifications and alert response, while monitor configuration remains a web workflow.
- Fing explicitly positions Fing Web as the browser dashboard and says its monitoring data comes from Fing Desktop or Fing Agent.
- Tailscale's docs continue to rely on the admin console and web interfaces for device management and onboarding.

This is the consistent pattern: web for setup and administration, mobile for visibility on the go.

## Billing and app-store implications

### Apple

If you make a consumer-facing iOS app that sells digital subscriptions inside the app, Apple rules make billing much more complex.

Relevant current guidance:

- Apple App Review Guideline 3.1.2 allows SaaS subscriptions in apps.
- Apple 3.1.3(f) allows a free stand-alone companion app to a paid web tool without in-app purchase, as long as there is no purchasing inside the app and no in-app calls to action to buy outside the app.
- Apple 3.1.3(c) is narrower and mostly helps true organization-only enterprise sales, not your current freelancer/founder market.

For HostLens, that means:

- web-first billing is simpler
- mobile companion is allowed if it stays companion-only
- mobile-only monetization creates unnecessary app-review and billing work right now

### Google Play

Google Play's current billing docs are more flexible than they used to be, but in-app monetization is still a real implementation burden.

Relevant current guidance:

- Google's billing docs are still built around selling digital goods and subscriptions inside the Android app when you monetize in-app.
- Google also supports external offers and alternative billing programs, but these require extra eligibility, reporting, backend work, and Play-specific flows.
- Google's official FAQ also says a consumption-only app is allowed, meaning users can log in and access something paid for elsewhere.

For HostLens, that means:

- web checkout avoids extra Android billing complexity
- companion mobile login is fine
- building mobile-first billing now slows product learning

## Why mobile-only is the wrong v1 for HostLens

If the website only shows features and every real user must download the mobile app:

- onboarding gets harder because the actual monitored devices are desktops
- billing gets harder because app-store rules enter the critical path
- B2B and prosumer trust drops because buyers expect a browser workspace for review and administration
- support gets harder because you'll debug native auth, subscriptions, app-store edge cases, and cross-platform sync before the core product is proven
- your conversion path gets worse because a prospect cannot go from landing page to account to working dashboard in one continuous browser flow

## Best split for HostLens

### Web app should include

- landing pages
- pricing
- signup / login
- Stripe billing
- device claim flow
- live overview dashboard
- alert feed
- history
- settings
- team and plan management later

### Mobile app should include later

- push notifications
- incident / alert inbox
- quick device posture view
- acknowledge / mute
- simple "call to action" alerts such as CPU spike, new process, or device offline

### Mobile app should not block

- account creation
- first purchase
- first device claim
- full alert configuration
- plan management

## Best go-to-market decision

For this product stage, the right move is:

1. Web-first product
2. Mobile-companion roadmap
3. Responsive web experience immediately
4. Native mobile only after customers are already using the web workspace

If you need app-store presence earlier, ship a narrow companion app instead of a full mobile-first product.

## Sources

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Billing docs: https://developer.android.com/google/play/billing/
- Google Play billing FAQ: https://android-developers.googleblog.com/2020/09/commerce-update-faqs.html
- Datadog Mobile App docs: https://docs.datadoghq.com/mobile/
- Better Stack mobile app docs: https://betterstack.com/docs/uptime/ios-and-android-mobile-apps/
- Better Stack mobile app launch note: https://betterstack.com/community/blog/mobile-app/
- Fing Web: https://www.fing.com/web-app/
- Fing FAQ: https://www.fing.com/faq/
- Tailscale add device: https://tailscale.com/docs/features/access-control/device-management/how-to/set-up
- Tailscale web interface: https://tailscale.com/docs/features/client/device-web-interface
