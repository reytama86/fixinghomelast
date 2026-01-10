import * as RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

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

// Helper: Get sensor value
const getSensorValue = (sensors: any[], type: string): number => {
  const sensor = sensors.find(
    s => s.keterangan_sensor.toLowerCase() === type.toLowerCase()
  );
  return sensor ? Number(sensor.nilai_sensor) : 0;
};

// Helper: Format symptoms
const formatSymptoms = (entry: PortableEntry): string => {
  const symptoms: string[] = [];
  if (entry.slow_growth) symptoms.push(SYMPTOM_LABELS.slow_growth);
  if (entry.leaf_wilt) symptoms.push(SYMPTOM_LABELS.leaf_wilt);
  if (entry.chlorosis) symptoms.push(SYMPTOM_LABELS.chlorosis);
  if (entry.weak_stem) symptoms.push(SYMPTOM_LABELS.weak_stem);
  if (entry.rot_root) symptoms.push(SYMPTOM_LABELS.rot_root);
  
  return symptoms.length > 0 ? symptoms.join(', ') : '-';
};

// Helper: Group data by block
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

// Generate HTML table for a block
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
        <td style="${entry.is_healthy ? 'color: green;' : 'color: red;'}">${healthStatus}</td>
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
            <th>Block</th>
            <th>Row</th>
            <th>Sect.</th>
            <th>Temp (°C)</th>
            <th>Hum (%)</th>
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

// Generate chart data points for a block
const generateChartData = (entries: PortableEntry[]): string => {
  // Sort by date
  const sorted = [...entries].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const labels = sorted.map(e => {
    const date = new Date(e.created_at);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const tempData = sorted.map(e => getSensorValue(e.sensors, 'temperature'));
  const humData = sorted.map(e => getSensorValue(e.sensors, 'humidity'));
  const phData = sorted.map(e => getSensorValue(e.sensors, 'ph') ); // Scale pH untuk visibility
  const ecData = sorted.map(e => getSensorValue(e.sensors, 'ec') ); // Scale EC
  const nData = sorted.map(e => getSensorValue(e.sensors, 'nitrogen') );
  const pData = sorted.map(e => getSensorValue(e.sensors, 'phosphorus') );
  const kData = sorted.map(e => getSensorValue(e.sensors, 'kalium') );

  return JSON.stringify({
    labels,
    datasets: [
      { label: 'Temperature (°C)', data: tempData, color: '#FF6384' },
      { label: 'Humidity (%)', data: humData, color: '#36A2EB' },
      { label: 'pH', data: phData, color: '#FFCE56' },
      { label: 'EC', data: ecData, color: '#4BC0C0' },
      { label: 'Nitrogen', data: nData, color: '#8344AD' },
      { label: 'Phosphorus', data: pData, color: '#2ECC71' },
      { label: 'Kalium', data: kData, color: '#F39C12' },
    ]
  });
};

// Generate chart HTML with Canvas
const generateBlockChart = (blockNumber: string, entries: PortableEntry[]): string => {
  const chartData = generateChartData(entries);
  
  return `
    <div class="chart-section">
      <h3>Sensor Values Over Time - Block ${blockNumber}</h3>
      <canvas id="chart-${blockNumber}" width="700" height="300"></canvas>
      <script>
        (function() {
          const data = ${chartData};
          const canvas = document.getElementById('chart-${blockNumber}');
          const ctx = canvas.getContext('2d');
          
          const padding = 50;
          const chartWidth = canvas.width - padding * 2;
          const chartHeight = canvas.height - padding * 2;
          
          // Draw axes
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(padding, padding);
          ctx.lineTo(padding, canvas.height - padding);
          ctx.lineTo(canvas.width - padding, canvas.height - padding);
          ctx.stroke();
          
          // Draw Y axis labels (0-100)
          ctx.font = '10px Arial';
          ctx.fillStyle = '#000';
          for (let i = 0; i <= 10; i++) {
            const y = canvas.height - padding - (chartHeight / 10) * i;
            const label = (i * 10).toString();
            ctx.fillText(label, padding - 30, y + 3);
            
            // Grid line
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
          }
          
          // Draw X axis labels (dates)
          const xStep = chartWidth / (data.labels.length - 1);
          data.labels.forEach((label, i) => {
            const x = padding + xStep * i;
            ctx.save();
            ctx.translate(x, canvas.height - padding + 15);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(label, 0, 0);
            ctx.restore();
          });
          
          // Draw lines for each sensor
          data.datasets.forEach((dataset, dsIndex) => {
            ctx.strokeStyle = dataset.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            dataset.data.forEach((value, i) => {
              const x = padding + xStep * i;
              const y = canvas.height - padding - (value / 100) * chartHeight;
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            });
            ctx.stroke();
            
            // Draw legend
            const legendY = 20 + dsIndex * 20;
            ctx.fillStyle = dataset.color;
            ctx.fillRect(canvas.width - 150, legendY, 15, 15);
            ctx.fillStyle = '#000';
            ctx.font = '11px Arial';
            ctx.fillText(dataset.label, canvas.width - 130, legendY + 12);
          });
        })();
      </script>
    </div>
  `;
};

// Generate complete HTML for PDF
const generatePortableReportHTML = (
  data: PortableEntry[],
  startDate: string,
  endDate: string,
  selectedBlock: string
): string => {
  const groupedData = selectedBlock === 'All Block (1-9)' 
    ? groupByBlock(data) 
    : { [selectedBlock.split(' ')[1]]: data };

  const blockSections = Object.entries(groupedData)
    .map(([blockNumber, entries]) => {
      return `
        ${generateBlockTable(blockNumber, entries)}
        ${generateBlockChart(blockNumber, entries)}
        <div class="page-break"></div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 10px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #B4DC45;
          padding-bottom: 10px;
        }
        
        .header h1 {
          color: #B4DC45;
          margin: 0;
          font-size: 24px;
        }
        
        .header p {
          margin: 5px 0;
          font-size: 12px;
        }
        
        .block-section {
          margin-bottom: 20px;
        }
        
        .block-section h2 {
          color: #333;
          font-size: 16px;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 9px;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: center;
        }
        
        th {
          background-color: #B4DC45;
          color: white;
          font-weight: bold;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .chart-section {
          margin: 20px 0;
          page-break-inside: avoid;
        }
        
        .chart-section h3 {
          font-size: 14px;
          color: #333;
          margin-bottom: 10px;
        }
        
        canvas {
          border: 1px solid #ddd;
          background: white;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        @media print {
          .page-break {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Portable Tools Report</h1>
        <p>Period: ${startDate} to ${endDate}</p>
        <p>Total Entries: ${data.length}</p>
        <p>Block: ${selectedBlock}</p>
      </div>
      
      ${blockSections}
    </body>
    </html>
  `;
};

// Main function to generate and save PDF
export const generatePortablePDF = async (
  data: PortableEntry[],
  startDate: string,
  endDate: string,
  selectedBlock: string
): Promise<string | null> => {
  try {
    // Request permissions for Android
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Storage permission is required');
        return null;
      }
    }

    const html = generatePortableReportHTML(data, startDate, endDate, selectedBlock);
    
    const filename = `Portable_Report_${selectedBlock.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`;
    
    const options = {
      html,
      fileName: filename,
      directory: Platform.OS === 'ios' ? 'Documents' : 'Downloads',
      base64: false,
    };

    const file = await RNHTMLtoPDF.convert(options);
    
    return file.filePath || null;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

// Fetch portable data for report
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

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};