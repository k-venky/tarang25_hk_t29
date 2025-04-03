
import React, { useState } from 'react';
import { LifeBuoy, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CrisisButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="bg-white dark:bg-charcoal rounded-lg shadow-lg p-4 mb-4 max-w-xs animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-poppins font-semibold text-sage">Crisis Support</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsExpanded(false)}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm mb-4">
            If you're experiencing a mental health emergency, please reach out for immediate help.
          </p>
          <div className="space-y-2">
            <Button 
              className="w-full bg-sage hover:bg-sage/90 text-white flex items-center gap-2"
              size="sm"
            >
              <Phone className="h-4 w-4" />
              Call Support Line
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-sage text-sage hover:bg-sage/10"
              size="sm"
            >
              Text With Counselor
            </Button>
          </div>
        </div>
      )}
      <Button 
        className="rounded-full bg-peach hover:bg-peach/90 h-14 w-14 flex items-center justify-center shadow-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <LifeBuoy className="h-6 w-6 text-charcoal" />
        <span className="sr-only">Crisis Support</span>
      </Button>
    </div>
  );
};

export default CrisisButton;
