import Papa from 'papaparse';

function parseNumOrNull(val: string | undefined | null): number | null {
  if (val == null || val === '') return null;
  const cleaned = String(val).replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDollarOrNull(val: string | undefined | null): number | null {
  if (val == null) return null;
  const s = String(val).trim();
  if (s === '' || s === 'N/A') return null;
  const cleaned = s.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parsePercentOrNull(val: string | undefined | null): number | null {
  if (val == null) return null;
  const s = String(val).trim();
  if (s === '' || s === 'N/A') return null;
  const cleaned = s.replace(/%/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export interface DataRow {
  [key: string]: any;
  valuation: number;
  raised: number | null;
  exitYear: number;
  yearFounded: number | null;
  tte: number | null;
  exitDecade: number;
  verticalList: string[];
  efficiency: number | null;
}

export async function loadDataset(): Promise<DataRow[]> {
  const url = `${import.meta.env.BASE_URL}data/VC_Backed_Exits_July.csv`;
  const response = await fetch(url);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.replace(/^\uFEFF/, ''),
      complete: (results) => {
        const rows: DataRow[] = [];
        for (const raw of results.data as Record<string, string>[]) {
          const valuation = parseFloat((raw['Post Valuation'] || '0').replace(/,/g, ''));
          if (isNaN(valuation)) continue;

          const raised = parseNumOrNull(raw['Raised to Date']);
          const exitYear = new Date(raw['Deal Date']).getFullYear();
          const yearFounded = parseNumOrNull(raw['Year Founded']);
          const tteRaw = raw['Time to Exit']?.trim();
          const tte = tteRaw === '-' || tteRaw === '' ? null : parseNumOrNull(raw['Time to Exit']);
          const exitDecade = Math.floor(exitYear / 10) * 10;
          const verticalList = raw['Verticals']
            ? raw['Verticals'].split(',').map(v => v.trim()).filter(Boolean)
            : [];
          const efficiency = raised && raised > 0 ? valuation / raised : null;

          rows.push({
            ...raw,
            valuation,
            raised,
            exitYear,
            yearFounded,
            tte,
            exitDecade,
            verticalList,
            efficiency,
          });
        }
        resolve(rows);
      },
      error: (err) => reject(err),
    });
  });
}

export interface TokenRow {
  [key: string]: any;
  listingYear: number;
  listingDate: Date | null;
  mcAtListing: number | null;
  mc6m: number | null;
  mc12m: number | null;
  mc24m: number | null;
  fdvAtListing: number | null;
  fdv6m: number | null;
  fdv12m: number | null;
  fdv24m: number | null;
  mcFdvRatioListing: number | null;
  mcFdvRatio12m: number | null;
  priceAtListing: number | null;
  price6m: number | null;
  price12m: number | null;
  price24m: number | null;
  priceChange12m: number | null;
  sector: string;
  qualifiesBecause: string;
  mcReturn12m: number | null;
  avgMcBothDates: number | null;
}

export async function loadTokenDataset(): Promise<TokenRow[]> {
  const url = `${import.meta.env.BASE_URL}data/Token_Listings_Enhanced_Complete_CoinGecko_and_Tokenterminal.csv`;
  const response = await fetch(url);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.replace(/^\uFEFF/, ''),
      complete: (results) => {
        const rows: TokenRow[] = [];
        for (const raw of results.data as Record<string, string>[]) {
          const projectName = (raw['Project Name'] || '').trim();
          if (!projectName) continue;

          const listingYear = parseInt(raw['Year'], 10);
          if (isNaN(listingYear)) continue;

          const dateStr = (raw['Listing Date (First TT Data)'] || '').trim();
          const listingDate = dateStr ? new Date(dateStr) : null;

          const mcAtListing = parseDollarOrNull(raw['Market Cap at Listing ($)']);
          const mc6m = parseDollarOrNull(raw['Market Cap 6 Months After ($)']);
          const mc12m = parseDollarOrNull(raw['Market Cap 12 Months After ($)']);
          const mc24m = parseDollarOrNull(raw['Market Cap 24 Months After ($)']);

          const fdvAtListing = parseDollarOrNull(raw['FDV at Listing ($)']);
          const fdv6m = parseDollarOrNull(raw['FDV 6 Months After ($)']);
          const fdv12m = parseDollarOrNull(raw['FDV 12 Months After ($)']);
          const fdv24m = parseDollarOrNull(raw['FDV 24 Months After ($)']);

          const mcFdvRatioListing = parsePercentOrNull(raw['MC / FDV at Listing']);
          const mcFdvRatio12m = parsePercentOrNull(raw['MC / FDV 12 Months After']);

          const priceAtListing = parseDollarOrNull(raw['Token Price at Listing ($)']);
          const price6m = parseDollarOrNull(raw['Token Price 6 Months After ($)']);
          const price12m = parseDollarOrNull(raw['Token Price 12 Months After ($)']);
          const price24m = parseDollarOrNull(raw['Token Price 24 Months After ($)']);

          const priceChange12m = parsePercentOrNull(raw['Change in Token Price after 12 Months']);

          const sector = (raw['Sector / Vertical'] || '').trim();
          const qualifiesBecause = (raw['Qualifies Because'] || '').trim();

          const mcReturn12m =
            mcAtListing != null && mc12m != null && mcAtListing > 0
              ? ((mc12m - mcAtListing) / mcAtListing) * 100
              : null;

          const avgMcBothDates = parseDollarOrNull(raw['Average Market Cap (Both Dates) ($)']);

          rows.push({
            ...raw,
            listingYear,
            listingDate,
            mcAtListing,
            mc6m,
            mc12m,
            mc24m,
            fdvAtListing,
            fdv6m,
            fdv12m,
            fdv24m,
            mcFdvRatioListing,
            mcFdvRatio12m,
            priceAtListing,
            price6m,
            price12m,
            price24m,
            priceChange12m,
            sector,
            qualifiesBecause,
            mcReturn12m,
            avgMcBothDates,
          });
        }
        resolve(rows);
      },
      error: (err) => reject(err),
    });
  });
}
