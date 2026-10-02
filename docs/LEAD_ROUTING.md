# Netso Energy lead routing

## Recommended production path

Use a server-side webhook adapter between the website and the CRM. Do **not** place a HubSpot private-app token, Zoho token, or other CRM secret in browser JavaScript.

The calculator currently posts to `window.NETSO_LEAD_WEBHOOK` when that value is configured. When it is not configured, it stores the last payload locally so the UI can be tested without sending personal data externally.

Recommended first CRM target: **HubSpot Free CRM**. It is a practical starting point for a small commercial-sales pipeline and can later be replaced by Zoho CRM, Pipedrive, or a custom API without changing the form UX.

## Payload shape

```json
{
  "source": "netso-solar-calculator",
  "name": "Example Contact",
  "company": "Example Factory",
  "phone": "+8801700000000",
  "email": "contact@example.com",
  "consent": true,
  "region": "Chattogram",
  "regionSolarResource": 4.93,
  "monthlyConsumptionKwh": 100000,
  "roofAreaM2": 3000,
  "daylightLoadShare": 55,
  "tariffBasis": "11 kV industrial",
  "blendedTariff": 11.56,
  "outageHoursPerMonth": 8,
  "battery": false,
  "result": {
    "pvKwp": [300, 429],
    "annualGenerationKwh": [360000, 600000],
    "annualValueBdt": [4161600, 9636000]
  },
  "crm": {
    "lifecycleStage": "lead",
    "leadSource": "Website calculator",
    "tags": ["solar-calculator", "bangladesh"]
  }
}
```

## HubSpot adapter behavior

1. Receive the browser payload at a server-side endpoint.
2. Validate `name`, `company`, `phone`, `consent`, and payload size.
3. Upsert a HubSpot contact by email when available; otherwise use the phone number as the deduplication key.
4. Create or update a deal/ticket with the calculator context and selected region.
5. Add the lead to a `Website calculator` source view and notify the sales owner.
6. Return a generic success response to the browser; never return CRM tokens or raw API errors.

Suggested custom properties:

- `netso_region`
- `netso_monthly_consumption_kwh`
- `netso_roof_area_m2`
- `netso_daylight_load_share`
- `netso_tariff_basis`
- `netso_outage_hours_month`
- `netso_estimated_pv_kwp`
- `netso_estimated_annual_value_bdt`
- `netso_battery_interest`
- `netso_calculator_submitted_at`

## Privacy and operational requirements

- Keep the consent checkbox required and retain the timestamp.
- Publish the CRM provider and retention period in the privacy policy before production launch.
- Add rate limiting and bot protection at the webhook layer.
- Log delivery status without logging unnecessary personal data.
- Store the region and calculator context as lead qualification data, not as a feasibility guarantee.

## Solar map data note

The current map is an interactive **regional solar-resource baseline**, not live inverter generation. It uses NASA POWER climatology values at division-centre coordinates. A true live-generation map would require authenticated inverter, plant, or telemetry feeds and a separate aggregation service.
