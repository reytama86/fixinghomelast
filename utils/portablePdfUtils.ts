import RNPrint from 'react-native-print';
import RNFS from 'react-native-fs';
import { Platform, Alert } from 'react-native';
import moment from 'moment';

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
  symptom_counts?: Array<{
    symptom_type: string;
    plant_count: number;
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

const formatDateTime = (dateString: string): string => {
  return moment(dateString).format('YYYY/MM/DD HH:mm');
};

const formatSymptoms = (entry: PortableEntry): string => {
  const symptoms: string[] = [];
  
  const getPlantCount = (symptomType: string): number => {
    if (!entry.symptom_counts) return 0;
    const symptom = entry.symptom_counts.find(s => s.symptom_type === symptomType);
    return symptom ? symptom.plant_count : 0;
  };
  
  if (entry.slow_growth) {
    const count = getPlantCount('slow_growth');
    symptoms.push(`${SYMPTOM_LABELS.slow_growth} (${count} tanaman)`);
  }
  if (entry.leaf_wilt) {
    const count = getPlantCount('leaf_wilt');
    symptoms.push(`${SYMPTOM_LABELS.leaf_wilt} (${count} tanaman)`);
  }
  if (entry.chlorosis) {
    const count = getPlantCount('chlorosis');
    symptoms.push(`${SYMPTOM_LABELS.chlorosis} (${count} tanaman)`);
  }
  if (entry.weak_stem) {
    const count = getPlantCount('weak_stem');
    symptoms.push(`${SYMPTOM_LABELS.weak_stem} (${count} tanaman)`);
  }
  if (entry.rot_root) {
    const count = getPlantCount('rot_root');
    symptoms.push(`${SYMPTOM_LABELS.rot_root} (${count} tanaman)`);
  }
  
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

const generateBlockSummary = (entries: PortableEntry[]): string => {
  const totalEntries = entries.length;
  const healthyCount = entries.filter(e => e.is_healthy).length;
  const unhealthyCount = totalEntries - healthyCount;
  
  const totalUnhealthyPlants = entries.reduce((sum, entry) => {
    if (!entry.is_healthy && entry.symptom_counts) {
      return sum + entry.symptom_counts.reduce((s, sc) => s + sc.plant_count, 0);
    }
    return sum;
  }, 0);

  return `
    <table style="width: 100%; margin-bottom: 20px; border: 2px solid #B4DC45; border-collapse: collapse; background: #f8f9fa;">
      <tr>
        <td style="padding: 15px; border: 1px solid #ddd; font-weight: bold; width: 25%;">Total Pengukuran:</td>
        <td style="padding: 15px; border: 1px solid #ddd; font-size: 18px; font-weight: bold;">${totalEntries}</td>
        <td style="padding: 15px; border: 1px solid #ddd; font-weight: bold; width: 25%;">Status Sehat:</td>
        <td style="padding: 15px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: green;">${healthyCount}</td>
      </tr>
      <tr>
        <td style="padding: 15px; border: 1px solid #ddd; font-weight: bold;">Status Tidak Sehat:</td>
        <td style="padding: 15px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: red;">${unhealthyCount}</td>
        <td style="padding: 15px; border: 1px solid #ddd; font-weight: bold;">Total Tanaman Terdampak:</td>
        <td style="padding: 15px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: red;">${totalUnhealthyPlants} tanaman</td>
      </tr>
    </table>
  `;
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
    
    const totalUnhealthyPlants = entry.is_healthy 
      ? 0 
      : (entry.symptom_counts || []).reduce((sum, s) => sum + s.plant_count, 0);
    
    const formattedDateTime = formatDateTime(entry.created_at);
    
    return `
      <tr>
        <td style="font-size: 8px; white-space: nowrap;">${formattedDateTime}</td>
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
        <td style="font-weight: bold; ${!entry.is_healthy ? 'color: red;' : ''}">${totalUnhealthyPlants}</td>
        <td style="font-size: 8px;">${symptoms}</td>
      </tr>
    `;
  }).join('');

  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Tanggal & Waktu</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Blok</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Baris</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Gawang</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Suhu Tanah(°C)</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Kelembaban Tanah(%)</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">pH</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">EC</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">N</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">P</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">K</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Total Bunga</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Status</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Total Tanaman Tidak Sehat</th>
          <th style="border: 1px solid #ddd; padding: 8px 6px; text-align: center; background-color: #B4DC45; color: white; font-weight: bold; font-size: 10px;">Gejala</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

const generateSingleSensorChart = (
  blockNumber: string,
  entries: PortableEntry[],
  sensorLabel: string,
  sensorKey: string,
  color: string,
  minRange: number,
  maxRange: number
): string => {
  const sorted = [...entries].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sorted.length === 0) return '';

  const width = 900;
  const height = 400;
  const padding = { top: 60, right: 60, bottom: 100, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const labels = sorted.map(e => moment(e.created_at).format('DD/MM HH:mm'));
  const data = sorted.map(e => getSensorValue(e.sensors, sensorKey));

  const valueRange = maxRange - minRange;
  const scale = chartHeight / valueRange;
  const xStep = chartWidth / Math.max(labels.length - 1, 1);

  // Grid lines (6 lines)
  const gridLines = Array.from({ length: 7 }, (_, i) => {
    const value = minRange + (valueRange / 6) * i;
    const y = padding.top + chartHeight - ((value - minRange) * scale);
    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e0e0e0" stroke-width="1"/>
      <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="12" fill="#333" font-weight="bold">${value.toFixed(1)}</text>
    `;
  }).join('');

  // X labels - only show some labels to avoid overcrowding
  const labelInterval = Math.max(1, Math.floor(labels.length / 10));
  const xLabels = labels.map((label, i) => {
    if (i % labelInterval !== 0 && i !== labels.length - 1) return '';
    const x = padding.left + xStep * i;
    const y = height - padding.bottom + 25;
    return `
      <text x="${x}" y="${y}" text-anchor="end" font-size="10" fill="#333" transform="rotate(-45 ${x} ${y})">${label}</text>
    `;
  }).join('');

  // Line and points
  const points = data.map((value, i) => {
    const clampedValue = Math.max(minRange, Math.min(maxRange, value));
    const x = padding.left + xStep * i;
    const y = padding.top + chartHeight - ((clampedValue - minRange) * scale);
    return `${x},${y}`;
  }).join(' ');

  const circles = data.map((value, i) => {
    const clampedValue = Math.max(minRange, Math.min(maxRange, value));
    const x = padding.left + xStep * i;
    const y = padding.top + chartHeight - ((clampedValue - minRange) * scale);
    return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="white" stroke-width="2"/>`;
  }).join('');

  // Calculate average
  const average = data.reduce((sum, val) => sum + val, 0) / data.length;
  const avgY = padding.top + chartHeight - ((average - minRange) * scale);

  return `
    <div class="chart-section">
      <h3>${sensorLabel} - Block ${blockNumber}</h3>
      <p style="font-size: 12px; color: #666; margin: 5px 0;">Range: ${minRange} - ${maxRange} | Average: ${average.toFixed(2)}</p>
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="white"/>
        
        <!-- Grid lines and Y labels -->
        ${gridLines}
        
        <!-- Average line -->
        <line x1="${padding.left}" y1="${avgY}" x2="${width - padding.right}" y2="${avgY}" stroke="${color}" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
        <text x="${width - padding.right + 5}" y="${avgY + 4}" font-size="10" fill="${color}" font-weight="bold">Avg: ${average.toFixed(1)}</text>
        
        <!-- Axes -->
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#333" stroke-width="2"/>
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#333" stroke-width="2"/>
        
        <!-- X labels -->
        ${xLabels}
        
        <!-- Line and points -->
        <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3"/>
        ${circles}
        
        <!-- Axis labels -->
        <text x="${padding.left - 50}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#333" font-weight="bold" transform="rotate(-90 ${padding.left - 50} ${height / 2})">${sensorLabel}</text>
        <text x="${width / 2}" y="${height - 15}" text-anchor="middle" font-size="14" fill="#333" font-weight="bold">Waktu Pengukuran</text>
        <text x="${width / 2}" y="30" text-anchor="middle" font-size="16" fill="${color}" font-weight="bold">${sensorLabel} Over Time</text>
      </svg>
    </div>
  `;
};

const generateAllSensorCharts = (blockNumber: string, entries: PortableEntry[]): string => {
  const sensors = [
    { label: 'Suhu Tanah (°C)', key: 'temperature', color: '#FF6384', min: 0, max: 100 },
    { label: 'Kelembaban Tanah (%)', key: 'humidity', color: '#36A2EB', min: 0, max: 100 },
    { label: 'pH', key: 'ph', color: '#FFCE56', min: 0, max: 9 },
    { label: 'EC', key: 'ec', color: '#4BC0C0', min: 0, max: 300 },
    { label: 'Nitrogen (N)', key: 'nitrogen', color: '#9966FF', min: 0, max: 300 },
    { label: 'Phosphorus (P)', key: 'phosphorus', color: '#FF9F40', min: 0, max: 300 },
    { label: 'Kalium (K)', key: 'kalium', color: '#F39C12', min: 0, max: 300 },
  ];

  return sensors.map(sensor => 
    generateSingleSensorChart(
      blockNumber,
      entries,
      sensor.label,
      sensor.key,
      sensor.color,
      sensor.min,
      sensor.max
    )
  ).join('<div style="page-break-before: always;"></div>');
};

const generateBlockSection = (blockNumber: string, entries: PortableEntry[]): string => {
  return `
    <h2 style="color: #B4DC45; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #B4DC45; padding-bottom: 8px; font-weight: bold;">Block ${blockNumber}</h2>
    ${generateBlockSummary(entries)}
    ${generateBlockTable(blockNumber, entries)}
    
    <!-- Page break before charts -->
    <div style="page-break-before: always;"></div>
    
    <!-- Charts start on new page -->
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h2 style="color: #B4DC45; font-size: 22px; margin: 0;">Grafik Sensor - Block ${blockNumber}</h2>
      <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">Analisis Data Sensor Over Time</p>
    </div>
    ${generateAllSensorCharts(blockNumber, entries)}
    
    <!-- Page break after all charts of this block -->
    <div style="page-break-before: always;"></div>
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
    .map(([blockNumber, entries]) => generateBlockSection(blockNumber, entries))
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
          padding: 20px;
          font-size: 10px;
          background: white;
          color: #333;
          margin: 0;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
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
          page-break-after: always;
        }
        
        .block-section h2 {
          color: #B4DC45;
          font-size: 18px;
          margin-bottom: 15px;
          border-bottom: 2px solid #B4DC45;
          padding-bottom: 8px;
          font-weight: bold;
        }
        
        .charts-wrapper {
          margin-top: 30px;
        }
        
        .summary-box {
          background: #f8f9fa;
          border: 2px solid #B4DC45;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .summary-box h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
          font-weight: bold;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .summary-label {
          font-size: 11px;
          color: #666;
          font-weight: 500;
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        
        .table-wrapper {
          margin-bottom: 25px;
          overflow-x: auto;
          page-break-inside: avoid;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px 6px;
          text-align: center;
        }
        
        th:first-child,
        td:first-child {
          white-space: nowrap;
          min-width: 100px;
        }
        
        th {
          background-color: #B4DC45;
          color: white;
          font-weight: bold;
          font-size: 10px;
          text-transform: uppercase;
          position: sticky;
          top: 0;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        tr:hover {
          background-color: #f0f0f0;
        }
        
        .chart-section {
          margin: 25px 0;
          background: white;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          text-align: center;
          page-break-inside: avoid;
        }
        
        .chart-section h3 {
          font-size: 16px;
          color: #333;
          margin: 0 0 20px 0;
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
          
          .block-section {
            page-break-inside: avoid;
          }
          
          .summary-box {
            page-break-inside: avoid;
          }
          
          .table-wrapper {
            page-break-inside: avoid;
          }
          
          .chart-section {
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
        <p><strong>Generated:</strong> ${moment().format('DD MMMM YYYY, HH:mm')}</p>
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