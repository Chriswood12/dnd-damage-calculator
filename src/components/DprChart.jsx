import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDamageCalculator } from '../context/DamageCalculatorContext';
import { simulateDPR } from '../utils/dprSimulation';
import { Activity } from 'lucide-react';

const DprChart = () => {
    const { state } = useDamageCalculator();
    const [data, setData] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        setIsCalculating(true);
        // Use a small timeout to allow UI to render the "calculating" state if it takes long
        const timer = setTimeout(() => {
            const resultData = simulateDPR(state, 1000);
            setData(resultData);
            setIsCalculating(false);
        }, 50);

        return () => clearTimeout(timer);
    }, [
        state.attackCount,
        state.frenzy,
        state.actionSurge,
        state.reloadOnBonusAction,
        state.globalCrit,
        state.currentGunStack,
        state.reapersBloodHp,
        state.reapersBlood,
        state.bless,
        state.emboldeningBond,
        state.modifiers,
        state.effects
    ]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', backdropFilter: 'blur(10px)' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Target AC: {label}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color, fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                                {entry.name}: {entry.value} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>DPR</span>
                            </p>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-card" style={{ marginTop: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} />
                    Expected Damage Curve
                </h2>
                {isCalculating && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculating...</span>}
            </div>
            
            <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis 
                            dataKey="ac" 
                            stroke="var(--text-secondary)" 
                            tick={{ fill: 'var(--text-secondary)' }}
                            tickMargin={10}
                            minTickGap={10}
                        />
                        <YAxis 
                            stroke="var(--text-secondary)" 
                            tick={{ fill: 'var(--text-secondary)' }}
                            tickFormatter={(val) => Math.round(val)}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }} />
                        <Line 
                            name="Current Config"
                            type="monotone" 
                            dataKey="dpr" 
                            stroke="var(--accent-blood)" 
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: 'var(--accent-blood)', stroke: 'var(--bg-color)', strokeWidth: 2 }}
                            animationDuration={500}
                        />
                        <Line 
                            name="SS Turned Off"
                            type="monotone" 
                            dataKey="dprNoSS" 
                            stroke="var(--accent-gold)" 
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6, fill: 'var(--accent-gold)', stroke: 'var(--bg-color)', strokeWidth: 2 }}
                            animationDuration={500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DprChart;
