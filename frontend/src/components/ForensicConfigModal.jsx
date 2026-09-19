import React, { useState } from 'react';
import { X, CheckCircle2, RotateCcw, Target, Zap, Bot } from 'lucide-react';

export default function ForensicConfigModal({ calibration, onClose, onApply, theme }) {
  const [localCalibration, setLocalCalibration] = useState({ ...calibration });
  const isDark = theme === 'dark';

  const resetToFactory = () => {
    setLocalCalibration({
      peelResidueBTC: 0.25,
      velocityLatency: 1.8,
      mixerEntropySensitivity: 0.85,
      riskMinThreshold: 0.70
    });
  };

  const handleInputChange = (field, value) => {
    setLocalCalibration(prev => ({ ...prev, [field]: parseFloat(value) }));
  };

  const labelColor = isDark ? '#f8fafc' : '#0f172a';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? 'rgba(13, 20, 38, 0.8)' : '#ffffff';
  const borderCol = isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(148, 163, 184, 0.5)';

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, backgroundColor: isDark ? '#0d1426' : '#f8fafc', borderColor: borderCol }}>
        
        {/* Modal Header */}
        <div style={styles.header}>
          <div style={{ ...styles.title, color: isDark ? '#0284c7' : '#0284c7' }}>
            <Sliders size={18} /> ADVANCED FORENSIC CALIBARTION SANDBOX
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
        </div>

        {/* Modal Body */}
        <div style={styles.body}>
          <div style={{ color: subTextColor, fontSize: '0.8rem', marginBottom: '15px' }}>
            Adjust ML heuristic thresholds and detection criteria used by the isolationForest model. 
            Applying changes will re-calculate risk scores for all transactions.
          </div>

          {[
            { id: 'peelResidueBTC', label: 'CLASSIFY PEEL CHAIN RESIDUE', icon: Target, unit: 'BTC', min: 0.01, max: 1.0, step: 0.01 },
            { id: 'velocityLatency', label: 'VELOCITY LATENCY WINDOW', icon: Zap, unit: 'SECONDS', min: 0.1, max: 5.0, step: 0.1 },
            { id: 'mixerEntropySensitivity', label: 'MIXER ENTROPY SENSITIVITY', icon: Bot, unit: '', min: 0.50, max: 0.99, step: 0.01 },
            { id: 'riskMinThreshold: ', label: 'HUD MINIMUM RISK LEVEL', icon: ShieldAlert, unit: '% RISK', min: 0.0, max: 1.0, step: 0.05, format: v => (v*100).toFixed(0) },
          ].map(field => {
            const Icon = field.icon;
            const value = localCalibration[field.id];
            const formattedValue = field.format ? field.format(value) : value.toFixed(2);
            return (
              <div key={field.id} style={styles.configRow}>
                <label style={{ ...styles.inputLabel, color: labelColor }}>
                  <Icon size={14} color="#0284c7" /> {field.label}
                </label>
                <div style={styles.controlGroup}>
                  <span style={{ color: subTextColor, fontSize: '0.8rem' }}>{formattedValue} {field.unit}</span>
                  <input 
                    type="range" 
                    min={field.min} max={field.max} step={field.step} 
                    value={value} 
                    onChange={(e) => handleInputChange(field.id, e.target.value)} 
                    style={{ ...styles.slider, accentColor: '#0284c7' }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={styles.footer}>
          <button onClick={resetToFactory} style={styles.resetBtn}>
            <RotateCcw size={14} /> Factory Default
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={{ ...styles.cancelBtn, color: textColor, borderColor: borderCol }}>Cancel</button>
            <button onClick={() => onApply(localCalibration)} style={styles.applyBtn}>
              <CheckCircle2 size={14} /> Apply Calibration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { width: '450px', border: '1px solid', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  body: { display: 'flex', flexDirection: 'column', gap: '12px' },
  configRow: { display: 'flex', flexDirection: 'column', gap: '5px' },
  inputLabel: { fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' },
  controlGroup: { display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' },
  slider: { flex: 1 },
  footer: { display: 'flex', justifyContent: 'space-between', marginTop: '10px' },
  resetBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
  cancelBtn: { background: 'none', border: '1px solid', padding: '6px 15px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' },
  applyBtn: { background: '#0284c7', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }
};