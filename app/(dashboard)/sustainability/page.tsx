'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStadium } from '@/components/stadium/StadiumContext';
import { 
  Leaf, Sun, Droplet, Zap, BatteryCharging, 
  Trash2, ShieldCheck, BarChart3, TrendingDown, Wind, Download,
  X, FileText, CheckCircle2, Loader2, AlertCircle, Eye
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to draw text with subscript 2 for chemical formulas like CO₂ and tCO₂e/h
const drawTextWithSubscripts = (
  doc: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  align: 'left' | 'right' = 'left', 
  fontSize: number = 9
) => {
  if (!text.includes('CO₂') && !text.includes('tCO₂')) {
    doc.text(text, x, y, { align });
    return;
  }

  let parts: { text: string; isSub: boolean }[] = [];
  if (text.includes('CO₂')) {
    const idx = text.indexOf('CO₂');
    parts = [
      { text: text.substring(0, idx + 2), isSub: false }, // "CO"
      { text: '2', isSub: true },                         // subscript "2"
      { text: text.substring(idx + 3), isSub: false }     // text after
    ];
  } else if (text.includes('tCO₂')) {
    const idx = text.indexOf('tCO₂');
    parts = [
      { text: text.substring(0, idx + 3), isSub: false }, // "tCO"
      { text: '2', isSub: true },                         // subscript "2"
      { text: text.substring(idx + 4), isSub: false }     // text after
    ];
  }

  doc.setFontSize(fontSize);
  const widths = parts.map(p => {
    if (p.isSub) {
      doc.setFontSize(fontSize * 0.7);
      const w = doc.getTextWidth(p.text);
      doc.setFontSize(fontSize);
      return w;
    } else {
      return doc.getTextWidth(p.text);
    }
  });

  const totalWidth = widths.reduce((a, b) => a + b, 0);
  let currentX = align === 'right' ? x - totalWidth : x;

  parts.forEach((p, idx) => {
    if (p.isSub) {
      doc.setFontSize(fontSize * 0.7);
      doc.text(p.text, currentX, y + (fontSize * 0.12));
      currentX += widths[idx];
    } else {
      doc.setFontSize(fontSize);
      doc.text(p.text, currentX, y);
      currentX += widths[idx];
    }
  });
  doc.setFontSize(fontSize); // restore
};

export default function SustainabilityPage() {
  const { user } = useAuth();
  const { selectedStadium } = useStadium();
  const [mounted, setMounted] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);
  
  // Ref for scroll locking and resetting scroll position
  const modalBodyRef = React.useRef<HTMLDivElement>(null);
  
  // PDF Document states
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  
  // Generation & download status tracking
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Report metadata
  const [reportId, setReportId] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Reset download status back to idle after 4 seconds of success
  useEffect(() => {
    if (downloadStatus === 'success') {
      const timer = setTimeout(() => {
        setDownloadStatus('idle');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [downloadStatus]);

  // Lock page scrolling when modal is open and reset scroll position to top
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
      // Guarantee scrollTop reset on Chrome/Firefox/Edge
      setTimeout(() => {
        if (modalBodyRef.current) {
          modalBodyRef.current.scrollTop = 0;
        }
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const generateReportInMemory = async () => {
    setExporting(true);
    setExportStatus('exporting');

    try {
      // Small artificial delay for visual feedback/satisfaction
      await new Promise(resolve => setTimeout(resolve, 1500));

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [12, 18, 32]; // Dark blue #0c1220
      const accentColor = [16, 185, 129]; // Emerald green #10b981
      const textColor = [51, 65, 85]; // Dark slate text
      const lightBg = [248, 250, 252]; // Light gray background for tables

      // Helper to draw headers & footers for content pages
      const addHeaderFooter = (pageNum: number, totalPages: number) => {
        // Top banner decoration
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 15, 'F');
        
        // Green accent line
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(0, 15, 210, 1.5, 'F');

        // Header Text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('FIFA WORLD CUP 2026  |  EXECUTIVE SUSTAINABILITY REPORT', 20, 10);
        
        // Footer Text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(`Generated on ${new Date().toLocaleString()}  |  Powered by StadiumOS AI`, 20, 287);
        doc.text(`Page ${pageNum} of ${totalPages}`, 190, 287, { align: 'right' });
      };

      // ----------------------------------------------------
      // PAGE 1: COVER PAGE
      // ----------------------------------------------------
      // Outer border
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(10, 10, 190, 277, 'S');

      // Top decorative bar
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(10, 10, 190, 25, 'F');
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(10, 35, 190, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('FIFA WORLD CUP 2026™  |  ESG COMMISSION DESK', 20, 25);

      // FIFA Gold Logo Placeholder in PDF Cover
      const pdfLogoX = 20;
      const pdfLogoY = 50;
      doc.setFillColor(253, 224, 71); // Gold yellow
      doc.circle(pdfLogoX + 6, pdfLogoY + 6, 8, 'F');
      doc.setFillColor(12, 18, 32);
      doc.circle(pdfLogoX + 6, pdfLogoY + 6, 7.2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.setTextColor(253, 224, 71);
      doc.text('FIFA', pdfLogoX + 6, pdfLogoY + 7.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('FIFA WORLD CUP 2026™ SUSTAINABILITY OFFICE', pdfLogoX + 18, pdfLogoY + 7);

      // Title & Subtitle
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('EXECUTIVE SUSTAINABILITY', 20, 95);
      doc.text('REPORT', 20, 108);

      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(20, 118, 40, 1.5, 'F');

      // Metadata block
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      const metaY = 180;
      doc.setFont('helvetica', 'bold');
      doc.text('PREPARED BY:', 20, metaY);
      doc.setFont('helvetica', 'normal');
      doc.text('StadiumOS AI System', 60, metaY);

      doc.setFont('helvetica', 'bold');
      doc.text('VENUE CONTEXT:', 20, metaY + 10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${selectedStadium.name} (${selectedStadium.city})`, 60, metaY + 10);

      doc.setFont('helvetica', 'bold');
      doc.text('MATCHDAY:', 20, metaY + 20);
      doc.setFont('helvetica', 'normal');
      doc.text('12', 60, metaY + 20);

      doc.setFont('helvetica', 'bold');
      doc.text('AUDIT DATE:', 20, metaY + 30);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString(), 60, metaY + 30);

      doc.setFont('helvetica', 'bold');
      doc.text('COMPLIANCE:', 20, metaY + 40);
      doc.setFont('helvetica', 'normal');
      doc.text('LEED Platinum Certified Standard', 60, metaY + 40);

      // Official Validation Badge on Cover Page
      doc.setFillColor(240, 253, 250); // Light teal/emerald
      doc.rect(130, metaY + 32, 60, 12, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.rect(130, metaY + 32, 60, 12, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(6, 95, 70);
      doc.text('✓ STATUS: VERIFIED', 160, metaY + 37, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(4, 120, 87);
      doc.text('FIFA ESG Standards Audited', 160, metaY + 41, { align: 'center' });

      // Footer branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('STADIUMOS AI', 20, 265);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Enterprise Operations and ESG Telemetry Integration Platform', 20, 270);

      // ----------------------------------------------------
      // PAGE 2: EXEC SUMMARY & KPIs
      // ----------------------------------------------------
      doc.addPage();
      addHeaderFooter(2, 4);

      // Section 1: Executive Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Section 1: Executive Summary', 20, 30);

      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(20, 33, 80, 33);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      const summaryText = [
        `This report compiles real-time environmental telemetry audits for ${selectedStadium.name} during Matchday 12 of the FIFA World Cup 2026. The venue operations have achieved high-efficiency ratings, backed by a renewable energy ratio of 86.2% and a composite ESG compliance score of 96/100 (Rank A+).`,
        `Through integrated solar canopy grids and rainwater recycling reservoirs, resource consumption has been significantly optimized. Direct Scope 1 emissions were maintained at 0.42 tCO2e/h, while indirect Scope 2 emissions stood at 0.78 tCO2e/h. Dynamic transit operations and active waste composting redirection systems successfully diverted 15.4 Tons of carbon and maintained a waste recycling rate of 78.4%.`
      ];

      let currentY = 40;
      summaryText.forEach(p => {
        const splitLines = doc.splitTextToSize(p, 170);
        doc.text(splitLines, 20, currentY);
        currentY += (splitLines.length * 5) + 3;
      });

      // Executive Summary Box (Green Callout Box)
      const boxY = currentY + 2;
      const boxHeight = 24;
      doc.setFillColor(240, 253, 250); // Emerald-50 background #f0fdfa
      doc.rect(20, boxY, 170, boxHeight, 'F');
      
      doc.setFillColor(16, 185, 129); // Emerald-500 left accent border
      doc.rect(20, boxY, 2.5, boxHeight, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(6, 95, 70); // Dark emerald text #065f46
      doc.text('EXECUTIVE SUSTAINABILITY AUDIT BRIEFING', 26, boxY + 6);
      
      // Bullets using vector checkmarks
      const drawCheck = (x: number, y: number) => {
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.5);
        doc.line(x, y + 1, x + 1, y + 2);
        doc.line(x + 1, y + 2, x + 3, y - 1);
      };
      
      drawCheck(26, boxY + 11);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(4, 120, 87);
      doc.text('ESG compliance targets successfully met', 31, boxY + 13);

      drawCheck(26, boxY + 17);
      doc.text('Renewable energy ratio exceeded target', 31, boxY + 19);

      drawCheck(105, boxY + 11);
      doc.text('Water conservation systems operating within limits', 110, boxY + 13);

      drawCheck(105, boxY + 17);
      doc.text('Zero environmental incidents or warnings logged', 110, boxY + 19);

      // Section 2: Environmental KPIs
      currentY = boxY + boxHeight + 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Section 2: Environmental KPIs', 20, currentY);

      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(20, currentY + 3, 80, currentY + 3);

      currentY += 10;
      
      const kpis = [
        { label: 'Renewable Energy Ratio', value: '86.2%' },
        { label: 'Stadium Power Demand', value: '4,200 kW' },
        { label: 'Carbon Offset Today', value: '15.4 Tons CO₂' },
        { label: 'ESG Compliance Score', value: '96 / 100 (Rank A+)' },
        { label: 'Scope 1 (Direct) Emissions', value: '0.42 tCO₂e/h' },
        { label: 'Scope 2 (Indirect) Emissions', value: '0.78 tCO₂e/h' },
        { label: 'Total Carbon Emissions', value: '1.20 tCO₂e/h' }
      ];

      kpis.forEach((kpi, idx) => {
        // Alternating background color
        if (idx % 2 === 0) {
          doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
          doc.rect(20, currentY - 4, 170, 7, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(kpi.label, 22, currentY);
        
        doc.setFont('helvetica', 'bold');
        drawTextWithSubscripts(doc, kpi.value, 188, currentY, 'right', 9);
        
        currentY += 8;
      });

      // Simple Charts (Key ESG Telemetry Visualizations)
      const chartsY = currentY + 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Key ESG Telemetry Visualizations', 20, chartsY);
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(20, chartsY + 2, 80, chartsY + 2);
      
      const chartBoxY = chartsY + 6;
      
      // Left Chart Box (Gauge & Bar)
      doc.setFillColor(248, 250, 252);
      doc.rect(20, chartBoxY, 80, 42, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, chartBoxY, 80, 42, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Renewable Energy & Carbon Offset', 24, chartBoxY + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Renewable Ratio (Target: 80%)', 24, chartBoxY + 12);
      doc.setFont('helvetica', 'bold');
      doc.text('86.2%', 96, chartBoxY + 12, { align: 'right' });
      // Progress Bar
      doc.setFillColor(226, 232, 240);
      doc.rect(24, chartBoxY + 15, 72, 3, 'F');
      doc.setFillColor(16, 185, 129); // green
      doc.rect(24, chartBoxY + 15, 72 * 0.862, 3, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.text('Carbon Offset Today', 24, chartBoxY + 24);
      doc.setFont('helvetica', 'bold');
      doc.text('15.4 / 20 Tons', 96, chartBoxY + 24, { align: 'right' });
      // Progress Bar
      doc.setFillColor(226, 232, 240);
      doc.rect(24, chartBoxY + 27, 72, 3, 'F');
      doc.setFillColor(14, 165, 233); // cyan
      doc.rect(24, chartBoxY + 27, 72 * (15.4 / 20), 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Daily Goal: 20.0 Tons CO₂ equivalent', 24, chartBoxY + 35);
      
      // Right Chart Box (Energy Mix & Waste Diversion)
      doc.setFillColor(248, 250, 252);
      doc.rect(110, chartBoxY, 80, 42, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(110, chartBoxY, 80, 42, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Energy Mix & Waste Diversion', 114, chartBoxY + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('Grid Energy Mix (kW)', 114, chartBoxY + 12);
      // Double Stacked progress bar Solar vs Wind
      doc.setFillColor(245, 158, 11); // Amber-500 Solar
      doc.rect(114, chartBoxY + 15, 72 * (3600 / 4200), 3, 'F');
      doc.setFillColor(139, 92, 246); // Violet-500 Wind
      doc.rect(114 + (72 * (3600 / 4200)), chartBoxY + 15, 72 * (600 / 4200), 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Solar: 3,600 kW (86%)', 114, chartBoxY + 21);
      doc.text('Wind: 600 kW (14%)', 186, chartBoxY + 21, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text('Waste Diversion Rate', 114, chartBoxY + 28);
      doc.setFont('helvetica', 'bold');
      doc.text('78.4%', 186, chartBoxY + 28, { align: 'right' });
      // Progress Bar
      doc.setFillColor(226, 232, 240);
      doc.rect(114, chartBoxY + 31, 72, 3, 'F');
      doc.setFillColor(16, 185, 129); // green
      doc.rect(114, chartBoxY + 31, 72 * 0.784, 3, 'F');

      // ----------------------------------------------------
      // PAGE 3: ENERGY, WATER & WASTE
      // ----------------------------------------------------
      doc.addPage();
      addHeaderFooter(3, 4);

      currentY = 30;

      // Section 3: Energy Infrastructure
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Section 3: Energy Infrastructure', 20, currentY);
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(20, currentY + 3, 80, currentY + 3);

      currentY += 10;

      const energyData = [
        { label: 'Solar Canopy Generation', value: '3,600 kW' },
        { label: 'Wind Harvester Generation', value: '600 kW' },
        { label: 'Battery Storage Capacity', value: '98% (1,500 kWh)' },
        { label: 'Grid Feed Return Rate', value: '240 kW net feed' }
      ];

      energyData.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
          doc.rect(20, currentY - 4, 170, 7, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(item.label, 22, currentY);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value, 188, currentY, { align: 'right' });
        currentY += 8;
      });

      // Section 4: Water Conservation
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Section 4: Water Conservation', 20, currentY);
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(20, currentY + 3, 80, currentY + 3);

      currentY += 10;

      const waterData = [
        { label: 'Rainwater Harvester Savings', value: '12,400 L saved' },
        { label: 'HVAC Ventilation Efficiency', value: '94.8%' },
        { label: 'Plumbing Graywater Supply', value: 'Sections 102 & 108 plumbing active' }
      ];

      waterData.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
          doc.rect(20, currentY - 4, 170, 7, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(item.label, 22, currentY);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value, 188, currentY, { align: 'right' });
        currentY += 8;
      });

      // Section 5: Waste Diversion
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Section 5: Waste Diversion', 20, currentY);
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(20, currentY + 3, 80, currentY + 3);

      currentY += 10;

      const wasteData = [
        { label: 'Organic Food Waste Composting', value: '840 kg diverted' },
        { label: 'PET Plastic Bottle Reclamation', value: '420 kg diverted' },
        { label: 'Aluminum Cup Reclamation', value: '220 kg diverted' },
        { label: 'General Waste Processed', value: '1,200 kg processed' },
        { label: 'Overall Recycling Rate', value: '78.4%' }
      ];

      wasteData.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
          doc.rect(20, currentY - 4, 170, 7, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(item.label, 22, currentY);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value, 188, currentY, { align: 'right' });
        currentY += 8;
      });

      // ----------------------------------------------------
      // PAGE 4: AI RECOMMENDATIONS
      // ----------------------------------------------------
      doc.addPage();
      addHeaderFooter(4, 4);

      currentY = 30;

      // Section 6: AI Recommendations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Section 6: AI Recommendations & Briefing', 20, currentY);
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(20, currentY + 3, 80, currentY + 3);

      currentY += 10;

      const recommendations = [
        {
          title: 'Increase Renewable Contribution during Peak Attendance',
          text: 'Leverage regional grid clean power contracts and activate Tesla MegaPack battery discharge when stadium attendance spikes above 65,000 to minimize local peak-load carbon penalties.',
          priority: 'CRITICAL',
          impact: 'HIGH',
          timeline: 'MATCHDAY 13',
          reduction: '2.8 Tons CO₂'
        },
        {
          title: 'Expand Rainwater Harvesting Capacity',
          text: 'Deploy secondary retention canopies over Gate 4 and Gate 5 structures. Expanding cistern volume by 15% will meet graywater flushing requirements.',
          priority: 'HIGH',
          impact: 'MEDIUM',
          timeline: 'Q3 2026',
          reduction: '1.2 Tons CO₂'
        },
        {
          title: 'Reduce HVAC Demand during Low Occupancy',
          text: 'Integrate concourse ticket-scanner telemetry with the building management interface to automatically scale back HVAC airflow by 30% in unoccupied concourse zones.',
          priority: 'MEDIUM',
          impact: 'HIGH',
          timeline: 'Q4 2026',
          reduction: '3.4 Tons CO₂'
        },
        {
          title: 'Optimize Waste Segregation near Concession Zones',
          text: 'Redistribute organic composting bays adjacent to concession food courts in South Concourse A. Enhanced segregation will increase recycling rates.',
          priority: 'MEDIUM',
          impact: 'MEDIUM',
          timeline: 'Q3 2026',
          reduction: '1.8 Tons CO₂'
        }
      ];

      recommendations.forEach((rec) => {
        // Draw card background
        doc.setFillColor(248, 250, 252);
        doc.rect(20, currentY, 170, 34, 'F');
        
        // Draw card border
        doc.setDrawColor(226, 232, 240);
        doc.rect(20, currentY, 170, 34, 'S');
        
        // Priority accent bar
        const priorityColor = rec.priority === 'CRITICAL' ? [239, 68, 68] : rec.priority === 'HIGH' ? [249, 115, 22] : [59, 130, 246];
        doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.rect(20, currentY, 3, 34, 'F');
        
        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(rec.title, 26, currentY + 6);
        
        // Description
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        const splitText = doc.splitTextToSize(rec.text, 158);
        doc.text(splitText, 26, currentY + 12);
        
        // Divider
        doc.setDrawColor(241, 245, 249);
        doc.line(25, currentY + 25, 185, currentY + 25);
        
        // Metadata text row
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.text(`PRIORITY: ${rec.priority}`, 26, currentY + 30);
        
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(`IMPACT: ${rec.impact}`, 70, currentY + 30);
        doc.text(`TIMELINE: ${rec.timeline}`, 110, currentY + 30);
        
        doc.setTextColor(16, 185, 129); // green
        drawTextWithSubscripts(doc, `REDUCTION: ${rec.reduction}`, 184, currentY + 30, 'right', 7);
        
        currentY += 38;
      });

      // Blockchain Verification Box
      const authY = currentY + 4;
      doc.setFillColor(248, 250, 252);
      doc.rect(20, authY, 170, 40, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, authY, 170, 40, 'S');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('REPORT AUTHENTICITY & BLOCKCHAIN VERIFICATION', 25, authY + 5);
      
      doc.setDrawColor(241, 245, 249);
      doc.line(25, authY + 7, 185, authY + 7);
      
      // Metadata Details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      doc.text('Generated By:', 25, authY + 12);
      doc.setFont('helvetica', 'bold');
      doc.text('StadiumOS AI Enterprise ESG Platform', 50, authY + 12);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Verification:', 25, authY + 18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('VERIFIED & AUDITED (LEED PLATINUM STANDARD)', 50, authY + 18);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Unique ID:', 25, authY + 24);
      doc.setFont('helvetica', 'bold');
      doc.text(reportId || 'FIFA-BCP-2026-UNKNOWN', 50, authY + 24);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Timestamp:', 25, authY + 30);
      doc.setFont('helvetica', 'bold');
      doc.text(generatedAt ? generatedAt.toLocaleString() : new Date().toLocaleString(), 50, authY + 30);

      // QR Code placeholder
      const qrX = 138;
      const qrY = authY + 10;
      doc.setFillColor(255, 255, 255);
      doc.rect(qrX, qrY, 15, 15, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(qrX, qrY, 15, 15, 'S');
      
      doc.setFillColor(15, 23, 42);
      doc.rect(qrX + 1.5, qrY + 1.5, 3.5, 3.5, 'F');
      doc.rect(qrX + 10, qrY + 1.5, 3.5, 3.5, 'F');
      doc.rect(qrX + 1.5, qrY + 10, 3.5, 3.5, 'F');
      doc.rect(qrX + 6, qrY + 6, 3, 3, 'F');
      doc.rect(qrX + 10, qrY + 10, 1.5, 1.5, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Verification Code', qrX + 7.5, qrY + 18, { align: 'center' });

      // Digital Signature placeholder
      const sigX = 160;
      const sigY = authY + 10;
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.3);
      doc.line(sigX, sigY + 11, sigX + 20, sigY + 11);
      
      // draw vector scribble
      doc.line(sigX + 2, sigY + 8, sigX + 5, sigY + 4);
      doc.line(sigX + 5, sigY + 4, sigX + 8, sigY + 10);
      doc.line(sigX + 8, sigY + 10, sigX + 12, sigY + 3);
      doc.line(sigX + 12, sigY + 3, sigX + 15, sigY + 9);
      doc.line(sigX + 15, sigY + 9, sigX + 18, sigY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text('StadiumOS ESG Seal', sigX + 10, sigY + 18, { align: 'center' });

      // Save PDF to memory blob
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);

      setPdfDoc(doc);
      setPdfBlobUrl(url);
      setExportStatus('success');
    } catch (e) {
      console.error(e);
      setExportStatus('error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportClick = () => {
    setIsModalOpen(true);
    setDownloadStatus('idle');
    setDownloadProgress(0);
    
    // Generate unique Report ID for this session
    if (!reportId) {
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      setReportId(`FIFA-BCP-2026-${randomId}`);
      setGeneratedAt(new Date());
    }

    if (!pdfDoc) {
      generateReportInMemory();
    }
  };

  const handleDownloadReport = async () => {
    if (!pdfDoc) return;
    setDownloadStatus('downloading');
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 120);

    try {
      // Simulate/visualize download processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      pdfDoc.save('BCPlace_ESG_Report_Matchday12.pdf');
      setDownloadProgress(100);
      setDownloadStatus('success');
    } catch (e) {
      console.error(e);
      setDownloadStatus('idle');
    } finally {
      clearInterval(interval);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsFullscreenPreviewOpen(false);
    
    // Revoke and clear cached PDF when the main dialog is closed
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
    setPdfDoc(null);
    setPdfBlobUrl(null);
    setReportId('');
    setGeneratedAt(null);
    setExportStatus('idle');
  };

  if (!mounted || !user) return null;

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/30 border border-emerald-950/30">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-400" />
            FIFA Sustainability Analytics
          </h2>
          <p className="text-sm text-slate-400">Matchday environmental metrics & executive ESG carbon auditing for {selectedStadium.name}.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="px-3 py-1 uppercase tracking-widest text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/20">
            LEED PLATINUM CERTIFIED
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportClick}
            className="text-xs gap-1.5 cursor-pointer h-9 px-4 border-slate-800 bg-[#070b13] text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all duration-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export ESG Report</span>
          </Button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Renewable Energy Usage */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Renewable Energy Ratio</CardTitle>
            <Sun className="h-4.5 w-4.5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">86.2%</div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <span>↑</span> +1.4% since last matchday
            </p>
          </CardContent>
        </Card>

        {/* Stadium Power Consumption */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Power Demand</CardTitle>
            <Zap className="h-4.5 w-4.5 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">4,200 kW</div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">Peak load capacity: 6,000 kW</p>
          </CardContent>
        </Card>

        {/* Carbon Saved Today */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Carbon Offset Today</CardTitle>
            <Leaf className="h-4.5 w-4.5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">15.4 Tons CO₂</div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Diverted via smart transit & solar
            </p>
          </CardContent>
        </Card>

        {/* ESG Compliance Score */}
        <Card className="bg-[#080d19]/45 border-slate-900/60 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">ESG Compliance Score</CardTitle>
            <ShieldCheck className="h-4.5 w-4.5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white">96 / 100 <span className="text-xs text-purple-400 font-bold ml-1">Rank A+</span></div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">FIFA Sustainability Standard</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Energy & Storage telemetry */}
        <div className="md:col-span-1 space-y-6">
          {/* Generation & Storage */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <BatteryCharging className="h-4.5 w-4.5 text-cyan-400" />
                Grid Microgeneration
              </CardTitle>
              <CardDescription className="text-xs">Solar arrays & local storage capacity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs pt-2">
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> Solar Canopy Generation
                </span>
                <Badge variant="success">3,600 kW</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-cyan-500" /> Wind Harvester Cell
                </span>
                <Badge variant="success">600 kW</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Tesla MegaPack Storage</span>
                <Badge variant="cyan" className="font-mono">98% (1,500 kWh)</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-950/40 border border-slate-900">
                <span className="text-slate-300 font-semibold">Grid Return Rate</span>
                <span className="font-bold text-white">240 kW net feed</span>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Conservation */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <Droplet className="h-4.5 w-4.5 text-blue-400" />
                Resource Conservation
              </CardTitle>
              <CardDescription className="text-xs">Water collection & smart building metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-800 bg-[#070b13]/40 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-white">
                  <span>Rainwater Harvester</span>
                  <Badge variant="success">12,400 L saved</Badge>
                </div>
                <p className="text-[10px] text-slate-400">Used for graywater plumbing throughout North and East concourses.</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-800 bg-[#070b13]/40 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-white">
                  <span>HVAC Smart Ventilation</span>
                  <Badge variant="cyan">94.8% Efficiency</Badge>
                </div>
                <p className="text-[10px] text-slate-400">CO₂ sensors automatically modulate air replacement rates by sector.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Waste auditing & Carbon breakdown */}
        <div className="md:col-span-2 space-y-6">
          {/* Material Redirection Audit */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                  <Trash2 className="h-4.5 w-4.5 text-emerald-400" />
                  Waste Redirection Audits
                </CardTitle>
                <CardDescription className="text-xs">Recycling diversion quotas & compost metrics</CardDescription>
              </div>
              <Badge variant="cyan" className="font-mono">Global Recycling Rate: 78.4%</Badge>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-2">
              {[
                { name: 'Organic Food Waste Composting', weight: '840 kg diverted', status: 'Stable', percent: 75, badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' },
                { name: 'PET Plastic Bottle Reclamation', weight: '420 kg diverted', status: 'Stable', percent: 45, badgeColor: 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' },
                { name: 'Aluminum Cup Reclamation Pods', weight: '220 kg diverted', status: 'Stable', percent: 30, badgeColor: 'bg-blue-950 text-blue-400 border border-blue-500/20' },
                { name: 'General Non-Recyclable Waste', weight: '1,200 kg processed', status: 'Near Capacity', percent: 90, badgeColor: 'bg-rose-950 text-rose-400 border border-rose-500/20' }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Audit Weight: {item.weight}</p>
                    </div>
                    <Badge className={`text-[9px] uppercase tracking-wider ${item.badgeColor}`}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.percent > 80 ? 'bg-rose-500' : item.percent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Operational emissions telemetry */}
          <Card className="bg-[#080d19]/45 border-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                <BarChart3 className="h-4.5 w-4.5 text-cyan-400" />
                Carbon Footprint Summary
              </CardTitle>
              <CardDescription className="text-xs">Real-time Scope 1 & Scope 2 carbon footprint logging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Scope 1 (Direct)</span>
                  <span className="text-lg font-black text-white">0.42 tCO₂e/h</span>
                  <span className="block text-[8px] text-emerald-400 font-mono mt-0.5">HVAC & generators</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Scope 2 (Indirect)</span>
                  <span className="text-lg font-black text-white">0.78 tCO₂e/h</span>
                  <span className="block text-[8px] text-cyan-400 font-mono mt-0.5">Imported grid power</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-900 bg-slate-950/30">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Total Emissions</span>
                  <span className="text-lg font-black text-slate-300">1.20 tCO₂e/h</span>
                  <span className="block text-[8px] text-amber-500 font-mono mt-0.5">Net zero target: 0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Premium ESG Report Preview Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04060d]/80 backdrop-blur-md">
            {/* Click backdrop to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-transparent"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0.1 }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-950/95 text-slate-100 shadow-[0_0_60px_-10px_rgba(16,185,129,0.25)] focus:outline-none flex flex-col"
            >
              {/* Green Top Accent line */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 shrink-0" />

              {/* STICKY HEADER */}
              <div className="shrink-0 z-20 bg-[#090f1d]/95 backdrop-blur-md border-b border-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                        FIFA World Cup 2026™
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ✓ Verified
                      </span>
                    </div>
                    <h2 className="text-base font-black text-white tracking-tight mt-0.5">
                      Executive Sustainability Report
                    </h2>
                    <p className="text-xs text-slate-400 font-medium font-mono">
                      {selectedStadium.name} <span className="text-slate-700 mx-1">•</span> Matchday 12
                    </p>
                  </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setIsFullscreenPreviewOpen(true)}
                    disabled={downloadStatus === 'downloading'}
                    className="border-emerald-500/25 hover:border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/20 cursor-pointer h-9 px-3.5 text-xs rounded-lg transition-all duration-200"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5 inline" />
                    Preview PDF
                  </Button>
                  <Button
                    onClick={handleDownloadReport}
                    disabled={downloadStatus === 'downloading'}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold cursor-pointer h-9 px-4 text-xs rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/10"
                  >
                    {downloadStatus === 'downloading' ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Downloading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCloseModal}
                    disabled={downloadStatus === 'downloading'}
                    className="text-slate-400 hover:text-white cursor-pointer h-9 w-9 p-0 flex items-center justify-center hover:bg-slate-900/50 rounded-lg transition-all duration-200"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {exporting ? (
                <div className="p-12 flex flex-col items-center justify-center min-h-[350px] space-y-4 flex-1">
                  <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
                  <h3 className="text-lg font-bold text-white tracking-wide">Opening Preview...</h3>
                  <p className="text-xs text-slate-400 max-w-xs text-center">
                    StadiumOS AI is compiling telemetry matrices, resource logs, and compliance scorecards.
                  </p>
                </div>
              ) : exportStatus === 'error' ? (
                <div className="p-8 flex flex-col items-center justify-center min-h-[300px] space-y-4 text-center flex-1">
                  <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Unable to generate ESG report</h3>
                    <p className="text-sm text-slate-400 mt-1">Please try again.</p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Button
                      onClick={generateReportInMemory}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                    >
                      Retry Generation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCloseModal}
                      className="border-slate-800 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* MODAL BODY (SCROLLABLE) */
                <div 
                  ref={modalBodyRef}
                  className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth"
                >
                  {/* Premium KPI Cards Grid */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key ESG Telemetry Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Renewable Energy */}
                      <motion.div
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="relative p-4 rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/20 to-slate-900/40 text-left shadow-lg overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-3 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                          <Sun className="h-9 w-9" />
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Renewable Energy</span>
                        <span className="text-xl font-black text-emerald-400">86.2%</span>
                      </motion.div>
                      
                      {/* Carbon Offset */}
                      <motion.div
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="relative p-4 rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/20 to-slate-900/40 text-left shadow-lg overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-3 text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors">
                          <Leaf className="h-9 w-9" />
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Carbon Offset</span>
                        <span className="text-xl font-black text-cyan-400">15.4 Tons</span>
                      </motion.div>

                      {/* ESG Score */}
                      <motion.div
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="relative p-4 rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-950/20 to-slate-900/40 text-left shadow-lg overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-3 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
                          <ShieldCheck className="h-9 w-9" />
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">ESG Compliance</span>
                        <span className="text-xl font-black text-purple-400">96 / 100</span>
                      </motion.div>

                      {/* Power Demand */}
                      <motion.div
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="relative p-4 rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-950/20 to-slate-900/40 text-left shadow-lg overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-3 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                          <Zap className="h-9 w-9" />
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Power Demand</span>
                        <span className="text-xl font-black text-amber-400">4,200 kW</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Cover page preview and Metadata sidebar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Miniature PDF Cover Page */}
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Report Cover Preview</h3>
                      
                      {/* Styled like a miniature PDF page */}
                      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.65),_0_0_0_1px_rgba(16,185,129,0.05)] transform hover:scale-[1.01] transition-transform duration-300">
                        <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-b from-[#090e1a]/90 via-slate-950/95 to-slate-950/70 text-center relative overflow-hidden min-h-[380px] flex flex-col justify-between">
                          {/* Decorative header line in mini page */}
                          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
                          
                          {/* FIFA Logo Placeholder */}
                          <div className="mt-4 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/10">
                              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[9px] font-black text-amber-400 uppercase tracking-widest">
                                FIFA
                              </div>
                            </div>
                            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-mono block mt-2">FIFA World Cup 2026™</span>
                          </div>

                          {/* Title block */}
                          <div className="my-6">
                            <h3 className="text-lg font-black text-white uppercase tracking-wide leading-none">
                              Executive Sustainability Report
                            </h3>
                            <div className="w-12 h-[1.5px] bg-emerald-500 mx-auto my-3" />
                            <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block">
                              Official Commission Briefing
                            </span>
                          </div>

                          {/* Metadata Table */}
                          <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400 max-w-md mx-auto mt-2 border-t border-b border-slate-800/40 py-3.5 bg-slate-900/20 px-4 rounded-lg">
                            <div className="text-left">
                              <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Prepared By</span>
                              <span className="text-slate-200 font-bold">StadiumOS AI</span>
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Venue Context</span>
                              <span className="text-slate-200 font-bold truncate block">{selectedStadium.name}</span>
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Matchday</span>
                              <span className="text-slate-200 font-bold">12</span>
                            </div>
                            <div className="text-left">
                              <span className="text-slate-500 block text-[8px] uppercase tracking-wider">Generated Date</span>
                              <span className="text-slate-200 font-bold truncate block">
                                {generatedAt ? generatedAt.toLocaleDateString() : ''}
                              </span>
                            </div>
                          </div>

                          {/* Official Validation Seal */}
                          <div className="mt-6 flex items-center justify-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">
                              Official Validation Code: <span className="text-slate-300 font-bold font-mono">WC2026-ESG-AUDIT</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Metadata Sidebar */}
                    <div className="md:col-span-1 space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Classification</h3>
                      <div className="bg-[#080d19]/45 border border-slate-900 rounded-xl p-5 h-full flex flex-col justify-between text-xs space-y-4">
                        <div>
                          <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4 text-slate-400">Document Metadata</h3>
                          <div className="space-y-4">
                            <div>
                              <span className="text-slate-500 block mb-1 text-[10px] uppercase tracking-wider">Classification</span>
                              <span className="text-slate-200 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px] inline-block font-mono">EXECUTIVE - RESTRICTED</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block mb-0.5 text-[10px] uppercase tracking-wider">Generated By</span>
                              <span className="text-slate-200 font-medium">StadiumOS AI Platform</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block mb-0.5 text-[10px] uppercase tracking-wider">Format</span>
                              <span className="text-slate-200 font-medium">PDF (A4 Corporate Layout)</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block mb-0.5 text-[10px] uppercase tracking-wider">Version</span>
                              <span className="text-slate-200 font-medium font-mono">v2.6 (Audited)</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block mb-0.5 text-[10px] uppercase tracking-wider">Report ID</span>
                              <span className="text-emerald-400 font-mono font-bold text-[11px] truncate block">{reportId}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-900">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[10px] uppercase tracking-wider">Auditing status</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ✓ Verified & Sealed
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for download */}
                  {downloadStatus === 'downloading' && (
                    <div className="space-y-1.5 p-4 rounded-xl bg-slate-900/50 border border-slate-850">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-emerald-400 animate-pulse flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Downloading report PDF...
                        </span>
                        <span className="text-slate-400">{downloadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-150" 
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success Alert */}
                  {downloadStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>✓ Executive Sustainability Report downloaded successfully.</span>
                    </motion.div>
                  )}

                  {/* AI Recommendations Cards inside Modal */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Recommendations Briefing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          title: 'Increase Renewable Contribution during Peak Attendance',
                          text: 'Leverage regional grid clean power contracts and activate Tesla MegaPack battery discharge when stadium attendance spikes above 65,000.',
                          priority: 'CRITICAL',
                          impact: 'HIGH',
                          timeline: 'MATCHDAY 13',
                          reduction: '2.8 Tons CO₂/Match'
                        },
                        {
                          title: 'Expand Rainwater Harvesting Capacity',
                          text: 'Deploy secondary retention canopies over Gate 4 and Gate 5 structures. Expanding cistern volume by 15% will meet greywater flushing requirements.',
                          priority: 'HIGH',
                          impact: 'MEDIUM',
                          timeline: 'Q3 2026',
                          reduction: '1.2 Tons CO₂/Match'
                        },
                        {
                          title: 'Reduce HVAC Demand during Low Occupancy',
                          text: 'Integrate ticketing scanner telemetry with the building management interface to scale back HVAC airflow by 30% in unoccupied concourse zones.',
                          priority: 'MEDIUM',
                          impact: 'HIGH',
                          timeline: 'Q4 2026',
                          reduction: '3.4 Tons CO₂/Match'
                        },
                        {
                          title: 'Optimize Waste Segregation near Concession Zones',
                          text: 'Redistribute organic composting bays adjacent to concession food courts in South Concourse A. Increasing sorting will lift diversion rates.',
                          priority: 'MEDIUM',
                          impact: 'MEDIUM',
                          timeline: 'Q3 2026',
                          reduction: '1.8 Tons CO₂/Match'
                        }
                      ].map((rec, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-900 bg-slate-900/30 text-left flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                                rec.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : rec.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                {rec.priority}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                                {rec.reduction}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-2">{rec.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1">{rec.text}</p>
                          </div>
                          <div className="pt-2.5 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-500">
                            <span>IMPACT: <strong className="text-slate-300">{rec.impact}</strong></span>
                            <span>TIMELINE: <strong className="text-slate-300">{rec.timeline}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen PDF Viewer Modal */}
      <AnimatePresence>
        {isFullscreenPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-slate-950/95 backdrop-blur-md" style={{ zIndex: 60 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="w-full h-full flex flex-col bg-[#070b13] border-t border-emerald-500/20 text-slate-100"
            >
              {/* Fullscreen Header */}
              <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4 bg-[#0a0f1d]">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">📄</span> Preview Sustainability Report
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{reportId}</p>
                </div>
                <button
                  onClick={() => setIsFullscreenPreviewOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Embedded PDF Viewer */}
              <div className="flex-1 p-4 md:p-6 overflow-hidden flex items-center justify-center">
                {pdfBlobUrl ? (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                    className="w-full h-full max-w-5xl rounded-xl border border-slate-900 shadow-2xl bg-slate-900"
                    title="Full Executive Report Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                    <span>Preparing high-fidelity preview...</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-900 px-6 py-4 flex items-center justify-end gap-3 bg-[#0a0f1d]">
                <Button
                  variant="ghost"
                  onClick={() => setIsFullscreenPreviewOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer h-10 px-5 text-xs rounded-lg transition-all duration-200"
                >
                  Close Preview
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  disabled={downloadStatus === 'downloading'}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold cursor-pointer h-10 px-6 text-xs rounded-lg transition-all duration-200"
                >
                  {downloadStatus === 'downloading' ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Downloading...
                    </span>
                  ) : (
                    'Download PDF'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
