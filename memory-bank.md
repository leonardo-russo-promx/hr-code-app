# HR Portal — Memory Bank

## Project
- Path: C:\Users\LeonardoRamosRusso\Desktop\01_Projects\hr-code-app
- App name: HR Portal
- Environment: 0002 - promxdev2 (46909147-be21-e105-8e23-4f771279df5b)
- Env URL: https://promxdev2.crm4.dynamics.com/
- App ID: 9c066e7f-a558-4a62-99c6-8f5441aa8044
- App URL: https://apps.powerapps.com/play/e/46909147-be21-e105-8e23-4f771279df5b/app/9c066e7f-a558-4a62-99c6-8f5441aa8044

## Completed Steps
- [x] Step 1: Prerequisites validated (Node v24, pac 2.8.1, auth = promxdev2)
- [x] Step 4: Scaffold (npx degit vite template)
- [x] Step 5: Initialize (npx power-apps init → power.config.json)
- [x] Step 6: Baseline deploy (push OK)
- [x] Step 7: Add data sources (Dataverse + Copilot Studio)
- [x] Design tokens (proMX brand, teal #00acad primary)
- [x] Step 8: Implement app (5 pages, layout, data lib, FAQ agent)
- [x] Step 9: Final deploy (build OK, push OK)

## Data Sources (planned)
Dataverse tables:
- promx_holidayrequest (absence/holiday requests — read-only)
- promx_holidayallowance (allowance + resourcesmanagerid = approving manager)
- bookableresource (employees; userid maps app user)
- promx_holidayrequestscalendar
- promx_localholiday
- promx_holidayarea
Copilot Studio agent (FAQ): proMX HR (schema name: npmx_proMXHR, botid e96fab7b-ed8e-f011-b4cc-6045bde11de2)
Copilot Studio agent (Skills): Skill Finder (schema name: crf8e_agent, botid dae85050-d12d-f111-88b4-000d3a6690c9). MUST be published for the connector to work — an unpublished agent makes ExecuteCopilotAsyncV2 redirect to copilotstudio.microsoft.com → CORS failure in the browser. Both agents invoked via askAgent(schemaName,...) in faq.ts. Chat UI = reusable AgentChat (renders markdown via react-markdown + remark-gfm). Skill Finder uses FloatingAgentChat (bottom-right bubble).
Office 365 Users connector (office365users, connection 393897bd01ce4c20b7587a443fac43cf) — Manager_V2 fallback for approving manager
Skills tables: bookableresourcecharacteristic (resource↔characteristic + ratingvalue), characteristic (skills, characteristictype eq 1), ratingvalue (1–5). Create uses @odata.bind nav props: Resource /bookableresources, Characteristic /characteristics, RatingValue /ratingvalues.

## Gotcha: formatted-name fields are NOT $select-able
Fields like `characteristicname`, `statuscodename`, `promx_holidaytypename`, `promx_approveridname`, `promx_resourcesmanageridname` exist on the generated TS models but are annotation-only — putting them in `select` returns HTTP 400 and fails the WHOLE query (silent empty result). Rule: select only real fields (`_lookup_value`, choice code, real columns). Resolve display names client-side: choice labels via maps in format.ts (holidayTypeLabel/lengthTypeLabel/statusLabel); systemuser lookups (approver, manager) via resolveSystemUserNames() in hrData.ts; skill/rating names via the option lists in SkillsPage. (`promx_resourcename` IS a real text column and is fine.)

## Confirmed Scope
- Absence/holidays: read-only v1
- Onboarding: static checklist, client-side completion state
- Manager KPI: current user's own approving manager — primary from promx_holidayallowance (promx_defaultallowance eq true and current promx_allowanceyear), fallback Office 365 Users Manager_V2(upn).displayName
- Branding: proMX brand tokens (primary orange ~#ff6600) via powercat-code-apps, ref https://promx.net/en/

## Pages
Home/KPIs · Absence Requests · Holidays · My Skills · FAQ (Copilot chat) · Onboarding

## Next Steps
- Run /add-dataverse for the 6 tables
- Run /add-mcscopilot for proMX HR agent
- Generate design tokens
- Implement pages, final deploy
