import React, { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { Subscription } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

interface StatsPageProps {
  subscriptions: Subscription[];
}

const StatsPage: React.FC<StatsPageProps> = ({ subscriptions }) => {
    const totalMonthlyCost = subscriptions.reduce((acc, sub) => {
        if (sub.paymentFrequency === 'Mensal') return acc + sub.cost;
        if (sub.paymentFrequency === 'Anual') return acc + sub.cost / 12;
        if (sub.paymentFrequency === '2 anos') return acc + sub.cost / 24;
        if (sub.paymentFrequency === '5 anos') return acc + sub.cost / 60;
        return acc;
    }, 0);

    const totalYearlyCost = totalMonthlyCost * 12;

    const categoryData = useMemo(() => {
        const data = subscriptions.reduce((acc, sub) => {
            if (!acc[sub.category]) acc[sub.category] = 0;
            acc[sub.category] += sub.cost;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [subscriptions]);

    const paymentMethodData = useMemo(() => {
        const data = subscriptions.reduce((acc, sub) => {
            if (!acc[sub.paymentMethod]) acc[sub.paymentMethod] = 0;
            acc[sub.paymentMethod] += 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [subscriptions]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Estatísticas Gerais</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-bold text-blue-600">{subscriptions.length}</p><p className="text-gray-500">Assinaturas Ativas</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-bold text-green-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(totalMonthlyCost)}</p><p className="text-gray-500">Custo Mensal</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center"><p className="text-4xl font-bold text-purple-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(totalYearlyCost)}</p><p className="text-gray-500">Custo Anual</p></div>
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Divisão de Custos</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold text-lg mb-4 text-center">Divisão por Categoria (Custo Mensal)</h3>
                        <div style={{ width: '100%', height: 300 }}><ResponsiveContainer><PieChart><Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">{categoryData.map((__, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Legend /></PieChart></ResponsiveContainer></div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold text-lg mb-4 text-center">Divisão por Método de Pagamento</h3>
                        <div style={{ width: '100%', height: 300 }}><ResponsiveContainer><PieChart><Pie data={paymentMethodData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#82ca9d" dataKey="value" nameKey="name">{paymentMethodData.map((__, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Legend /></PieChart></ResponsiveContainer></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;