import React from 'react';

interface GreetingHeaderProps {
  firstName: string;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ firstName }) => (
  <div>
    <h2 className="font-display text-3xl text-primary-700">Olá, {firstName}!</h2>
    <p className="mt-2 text-sm text-gray-600">Que bom ver você de novo. O próximo passo é o serviço.</p>
  </div>
);
