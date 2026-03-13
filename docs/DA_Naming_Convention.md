# DA File Naming Convention

**IMPORTANT: Follow this naming convention for EVERY file you generate for download.**

## Format

```
DA_{Department}_{Subcategory}_{Description}_{YYYY-MM-DD}.{ext}
```

- **DA_** — always starts with this prefix (triggers auto-filing)
- **Department** — which part of the business (see table below)
- **Subcategory** — which subfolder within that department
- **Description** — what the file is (use PascalCase or hyphen-separated, keep it short)
- **Date** — always YYYY-MM-DD format
- **Extension** — .pdf, .pptx, .xlsx, .docx, .csv, .html, .jpg, .png, etc.

## Department Codes

| Code | Maps to Folder | Use for |
|------|---------------|---------|
| `Sales` | 1_Sales | Prospects, snapshots, proposals, discovery, partners |
| `Marketing` | 2_Marketing | Content, LinkedIn, Substack, podcast, speaking |
| `Clients` | 3_Clients | Active client deliverables, archives |
| `Ops` | 4_Operations | Strategy, tools, processes, daily/weekly reports |
| `Finance` | 5_Finance | Invoices, expenses, QuickBooks, tax |
| `Assets` | 6_Assets | Brand, templates, media, IP |

## Subcategory Codes

### Sales
| Code | Folder | Examples |
|------|--------|----------|
| `Prospects` | 1.1_Prospects | Lead lists, research CSVs, prospect data exports |
| `Snapshots` | 1.2_Snapshots | AI visibility snapshots, competitive reports |
| `Proposals` | 1.3_Proposals | SOWs, pricing docs, proposals |
| `Discovery` | 1.4_Discovery_Calls | Discovery decks, call sheets, prep docs |
| `Partners` | 1.5_Partners | Partner plans, co-marketing docs |
| `Scripts` | 1.6_Scripts_and_Templates | Outreach scripts, email/DM templates |

### Marketing
| Code | Folder | Examples |
|------|--------|----------|
| `Positioning` | 2.1_Positioning | Positioning docs, messaging guides |
| `Content` | 2.2_Content | Blog drafts, LinkedIn posts, Substack drafts |
| `Podcast` | 2.3_Podcast | Episode notes, guest prep docs |
| `Speaking` | 2.4_Speaking | Talk decks, event prep, speaker bios |
| `Sequences` | 2.5_Outreach_Sequences | Email/DM sequence docs |

### Clients
| Code | Folder | Examples |
|------|--------|----------|
| `ActiveClient` | 3.1_Active | Client deliverables (include client name in Description) |
| `Archive` | 3.2_Archive | Archived client files |

### Operations
| Code | Folder | Examples |
|------|--------|----------|
| `Strategy` | 4.1_Strategy | Strategy docs, business plans, OKRs |
| `Tools` | 4.2_Tools | Tool configs, skills, workspace flows |
| `Processes` | 4.3_Processes | Daily/weekly reports, SOPs, process docs |
| `Legal` | 4.4_Legal | Contracts, NDAs, terms |

### Finance
| Code | Folder | Examples |
|------|--------|----------|
| `Invoices` | 5.1_Invoices | Client invoices |
| `Expenses` | 5.2_Expenses | Receipts, expense reports |
| `QB` | 5.3_QuickBooks_Exports | QuickBooks exports |
| `Tax` | 5.4_Tax | Tax documents |

### Assets
| Code | Folder | Examples |
|------|--------|----------|
| `Brand` | 6.1_Brand | Brand guide updates, logo exports |
| `Templates` | 6.2_Templates | Reusable templates (email, proposal, snapshot) |
| `Media` | 6.3_Media | B-roll, headshots, stock photos |
| `IP` | 6.4_IP | Frameworks, Pre-Purposing, Three Revolutions |

## Examples

```
DA_Ops_Processes_WeeklyReport_2026-03-06.pdf
DA_Ops_Processes_DailyReport_2026-03-08.pdf
DA_Sales_Snapshots_HingeMarketing_2026-03-08.pdf
DA_Sales_Snapshots_BreachRx-DM_2026-03-08.jpg
DA_Sales_Discovery_RevPal-Deck_2026-03-12.pptx
DA_Sales_Prospects_CyberLeads-Export_2026-03-08.xlsx
DA_Sales_Partners_Hinge-CoMarketing_2026-03-08.pdf
DA_Marketing_Content_LinkedIn-AIVideo_2026-03-08.md
DA_Marketing_Speaking_Apr14Talk-Slides_2026-04-14.pptx
DA_Clients_ActiveClient_Quatrain-VideoStrategy_2026-03-08.pdf
DA_Ops_Strategy_Q2-Plan_2026-03-08.pdf
DA_Finance_Invoices_Quatrain-Mar_2026-03-08.pdf
DA_Assets_Brand_LogoExport_2026-03-08.png
```

## How Auto-Filing Works

Any file starting with `DA_` that lands in ~/Downloads gets automatically moved to the correct folder based on the Department and Subcategory codes. A background script runs on Mac login and handles this in real-time.

Files that DON'T start with `DA_` are left alone in Downloads.

## For Browser Claude

When generating any file for Dane Frederiksen / Digital Accomplice, always name it using this convention. The auto-filer will handle the rest. If you're unsure which subcategory to use, default to:
- Reports → `DA_Ops_Processes_`
- Prospect research → `DA_Sales_Prospects_`
- Snapshots → `DA_Sales_Snapshots_`
- Decks → `DA_Sales_Discovery_`
- Content drafts → `DA_Marketing_Content_`
