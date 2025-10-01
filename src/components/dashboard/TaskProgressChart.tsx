import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const data = [
  { name: 'In Progress', value: 40, color: '#F4A100' },
  { name: 'Backlog', value: 60, color: '#5B7FFF' },
];
export function TaskProgressChart() {
  return (
    <Card className="col-span-12 lg:col-span-4">
      <CardHeader>
        <CardTitle>Task Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}