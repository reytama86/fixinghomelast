import RNPrint from 'react-native-print';
import RNFS from 'react-native-fs';
import { Platform, Alert } from 'react-native';

interface PortableEntry {
  id: number;
  keterangan_portable: string;
  block_number: string;
  row_num: string;
  section_number: string;
  flower_score: number;
  is_healthy: number;
  slow_growth: number;
  leaf_wilt: number;
  chlorosis: number;
  weak_stem: number;
  rot_root: number;
  created_at: string;
  sensors: Array<{
    keterangan_sensor: string;
    nilai_sensor: number;
  }>;
}

interface GroupedData {
  [blockNumber: string]: PortableEntry[];
}

const SYMPTOM_LABELS: { [key: string]: string } = {
  slow_growth: 'Pertumbuhan lambat',
  leaf_wilt: 'Daun layu',
  chlorosis: 'Klorosis',
  weak_stem: 'Batang lemas',
  rot_root: 'Kebusukan akar',
};

const getSensorValue = (sensors: any[], type: string): number => {
  const sensor = sensors.find(
    s => s.keterangan_sensor.toLowerCase() === type.toLowerCase()
  );
  return sensor ? Number(sensor.nilai_sensor) : 0;
};

const formatSymptoms = (entry: PortableEntry): string => {
  const symptoms: string[] = [];
  if (entry.slow_growth) symptoms.push(SYMPTOM_LABELS.slow_growth);
  if (entry.leaf_wilt) symptoms.push(SYMPTOM_LABELS.leaf_wilt);
  if (entry.chlorosis) symptoms.push(SYMPTOM_LABELS.chlorosis);
  if (entry.weak_stem) symptoms.push(SYMPTOM_LABELS.weak_stem);
  if (entry.rot_root) symptoms.push(SYMPTOM_LABELS.rot_root);
  
  return symptoms.length > 0 ? symptoms.join(', ') : '-';
};

const groupByBlock = (data: PortableEntry[]): GroupedData => {
  return data.reduce((acc: GroupedData, entry) => {
    const block = entry.block_number;
    if (!acc[block]) {
      acc[block] = [];
    }
    acc[block].push(entry);
    return acc;
  }, {});
};

const getFlowerScoreLabel = (score: number): string => {
  const labels: { [key: number]: string } = {
    0: 'Tidak ada bunga',
    1: '1-2 tanaman berbunga',
    2: '3-4 tanaman berbunga',
    3: '5-6 tanaman berbunga',
    4: '7-8 tanaman berbunga',
    5: 'Lebat (>50)',
  };
  return labels[score] || '-';
};

const generateBlockTable = (blockNumber: string, entries: PortableEntry[]): string => {
  const rows = entries.map((entry, index) => {
    const temp = getSensorValue(entry.sensors, 'temperature');
    const hum = getSensorValue(entry.sensors, 'humidity');
    const ph = getSensorValue(entry.sensors, 'ph');
    const ec = getSensorValue(entry.sensors, 'ec');
    const n = getSensorValue(entry.sensors, 'nitrogen');
    const p = getSensorValue(entry.sensors, 'phosphorus');
    const k = getSensorValue(entry.sensors, 'kalium');
    
    const healthStatus = entry.is_healthy ? 'Sehat' : 'Tidak Sehat';
    const symptoms = entry.is_healthy ? '-' : formatSymptoms(entry);
    const flowerLabel = getFlowerScoreLabel(entry.flower_score);
    
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${entry.block_number}</td>
        <td>${entry.row_num}</td>
        <td>${entry.section_number}</td>
        <td>${temp.toFixed(1)}</td>
        <td>${hum.toFixed(0)}</td>
        <td>${ph.toFixed(1)}</td>
        <td>${ec.toFixed(1)}</td>
        <td>${n.toFixed(0)}</td>
        <td>${p.toFixed(0)}</td>
        <td>${k.toFixed(0)}</td>
        <td style="font-size: 9px;">${flowerLabel}</td>
        <td style="${entry.is_healthy ? 'color: green; font-weight: bold;' : 'color: red; font-weight: bold;'}">${healthStatus}</td>
        <td style="font-size: 9px;">${symptoms}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="block-section">
      <h2>Block ${blockNumber}</h2>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Blok</th>
            <th>Baris</th>
            <th>Gawang</th>
            <th>Suhu Tanah(°C)</th>
            <th>Kelembaban Tanah(%)</th>
            <th>pH</th>
            <th>EC</th>
            <th>N</th>
            <th>P</th>
            <th>K</th>
            <th>Total Bunga</th>
            <th>Status</th>
            <th>Gejala</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
};

const generateBlockChartSVG = (blockNumber: string, entries: PortableEntry[]): string => {
  const sorted = [...entries].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sorted.length === 0) return '';

  const width = 900;
  const height = 400;
  const padding = { top: 40, right: 180, bottom: 80, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const labels = sorted.map(e => {
    const date = new Date(e.created_at);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const datasets = [
    { label: 'Temp (°C)', data: sorted.map(e => getSensorValue(e.sensors, 'temperature')), color: '#FF6384' },
    { label: 'Hum (%)', data: sorted.map(e => getSensorValue(e.sensors, 'humidity')), color: '#36A2EB' },
    { label: 'pH', data: sorted.map(e => getSensorValue(e.sensors, 'ph') * 10), color: '#FFCE56' },
    { label: 'EC', data: sorted.map(e => getSensorValue(e.sensors, 'ec')), color: '#4BC0C0' },
    { label: 'N', data: sorted.map(e => getSensorValue(e.sensors, 'nitrogen')), color: '#9966FF' },
    { label: 'P', data: sorted.map(e => getSensorValue(e.sensors, 'phosphorus')), color: '#FF9F40' },
    { label: 'K', data: sorted.map(e => getSensorValue(e.sensors, 'kalium')), color: '#F39C12' },
  ];

  let maxValue = 0;
  datasets.forEach(ds => {
    const max = Math.max(...ds.data);
    if (max > maxValue) maxValue = max;
  });
  
  const scale = maxValue > 0 ? chartHeight / maxValue : 1;
  const xStep = chartWidth / Math.max(labels.length - 1, 1);

  const gridLines = Array.from({ length: 11 }, (_, i) => {
    const y = padding.top + chartHeight - (chartHeight / 10) * i;
    const value = (i * 10).toFixed(0);
    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e0e0e0" stroke-width="1"/>
      <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#333">${value}</text>
    `;
  }).join('');

  const xLabels = labels.map((label, i) => {
    const x = padding.left + xStep * i;
    const y = height - padding.bottom + 20;
    return `
      <text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#333" transform="rotate(-30 ${x} ${y})">${label}</text>
    `;
  }).join('');

  const lines = datasets.map((dataset) => {
    const points = dataset.data.map((value, i) => {
      const x = padding.left + xStep * i;
      const y = padding.top + chartHeight - (value * scale);
      return `${x},${y}`;
    }).join(' ');

    const circles = dataset.data.map((value, i) => {
      const x = padding.left + xStep * i;
      const y = padding.top + chartHeight - (value * scale);
      return `<circle cx="${x}" cy="${y}" r="3" fill="${dataset.color}"/>`;
    }).join('');

    return `
      <polyline points="${points}" fill="none" stroke="${dataset.color}" stroke-width="2.5"/>
      ${circles}
    `;
  }).join('');

  const legend = datasets.map((dataset, i) => {
    const y = 60 + i * 25;
    return `
      <rect x="${width - padding.right + 20}" y="${y}" width="18" height="18" fill="${dataset.color}" stroke="#666" stroke-width="1"/>
      <text x="${width - padding.right + 45}" y="${y + 13}" font-size="12" fill="#333" font-weight="bold">${dataset.label}</text>
    `;
  }).join('');

  return `
    <div class="chart-section">
      <h3>Sensor Values Over Time - Block ${blockNumber}</h3>
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="white"/>
        
        <!-- Grid lines and Y labels -->
        ${gridLines}
        
        <!-- Axes -->
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#333" stroke-width="2"/>
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#333" stroke-width="2"/>
        
        <!-- X labels -->
        ${xLabels}
        
        <!-- Lines and points -->
        ${lines}
        
        <!-- Legend box -->
        <rect x="${width - padding.right + 10}" y="50" width="160" height="${datasets.length * 25 + 20}" fill="white" stroke="#ddd" stroke-width="1" opacity="0.95"/>
        ${legend}
        
        <!-- Axis labels -->
        <text x="${padding.left - 40}" y="${height / 2}" text-anchor="middle" font-size="13" fill="#333" font-weight="bold" transform="rotate(-90 ${padding.left - 40} ${height / 2})">Value</text>
        <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="13" fill="#333" font-weight="bold">Date</text>
        <text x="${width / 2}" y="25" text-anchor="middle" font-size="15" fill="#333" font-weight="bold">Sensor Trends</text>
      </svg>
    </div>
  `;
};

const generatePortableReportHTML = (
  data: PortableEntry[],
  startDate: string,
  endDate: string,
  selectedBlock: string
): string => {
  const groupedData = selectedBlock === 'All Block (1-9)' 
    ? groupByBlock(data) 
    : { [selectedBlock.split(' ')[1] || selectedBlock]: data };

  const blockSections = Object.entries(groupedData)
    .map(([blockNumber, entries]) => {
      return `
        ${generateBlockTable(blockNumber, entries)}
        ${generateBlockChartSVG(blockNumber, entries)}
        <div class="page-break"></div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          size: A4 landscape;
          margin: 15mm;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          padding: 10px;
          font-size: 10px;
          background: white;
          color: #333;
        }
        
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 3px solid #B4DC45;
          padding-bottom: 15px;
        }
        
        .header h1 {
          color: #B4DC45;
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .header p {
          margin: 5px 0;
          font-size: 12px;
          color: #555;
        }
        
        .header p strong {
          color: #333;
          font-weight: bold;
        }
        
        .block-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .block-section h2 {
          color: #B4DC45;
          font-size: 18px;
          margin-bottom: 15px;
          border-bottom: 2px solid #B4DC45;
          padding-bottom: 8px;
          font-weight: bold;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 9px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px 6px;
          text-align: center;
        }
        
        th {
          background-color: #B4DC45;
          color: white;
          font-weight: bold;
          font-size: 10px;
          text-transform: uppercase;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        tr:hover {
          background-color: #f0f0f0;
        }
        
        .chart-section {
          margin: 25px 0;
          page-break-inside: avoid;
          background: white;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          text-align: center;
        }
        
        .chart-section h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 15px;
          font-weight: bold;
        }
        
        svg {
          display: block;
          margin: 0 auto;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          .block-section, .chart-section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌱 Portable Tools Report</h1>
        <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Total Entries:</strong> ${data.length} | <strong>Block:</strong> ${selectedBlock}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString('id-ID')}</p>
      </div>
      
      ${blockSections}
    </body>
    </html>
  `;
};

export const generatePortablePDF = async (
  data: PortableEntry[],
  startDate: string,
  endDate: string,
  selectedBlock: string
): Promise<string | null> => {
  try {
    console.log('Starting PDF generation with react-native-print...');

    const html = generatePortableReportHTML(data, startDate, endDate, selectedBlock);
    const filename = `Portable_Report_${selectedBlock.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`;
    
    const { filePath } = await RNPrint.print({
      html: html,
      fileName: filename,
    });

    console.log('PDF generated successfully:', filePath);
    
    return filePath || null;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

export const fetchPortableReportData = async (
  startDate: string,
  endDate: string,
  blockNumber: string
): Promise<PortableEntry[]> => {
  try {
    let url = `https://iot-vanili-api.permataindonesia.com/api/portable-history?`;
    url += `startDate=${startDate}&endDate=${endDate}`;
    
    if (blockNumber !== 'All Block (1-9)') {
      const blockNum = blockNumber.split(' ')[1];
      url += `&blockNumber=${blockNum}`;
    }

    console.log('Fetching portable data from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Fetched data:', result.data?.length || 0, 'entries');
    return result.data || [];
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};