import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartExploring = () => {
    navigate('/explore');
  };

  const handleReadMore = () => {
    // You can update this to navigate to a specific page or open a modal
    window.open('https://filecoin.io', '_blank');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/toad.png')`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/50" />
      
      {/* Additional gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
        {/* Main Title */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
          TOADS Dataset Directory
        </h1>
        
        {/* Subtitle/Blurb */}
        <p className="mb-12 max-w-3xl text-xl leading-relaxed md:text-2xl lg:text-3xl">
          Discover Open Access Datasets stored on the Filecoin network. 
          Access high-quality data from climate research to population statistics, 
          WWW archives to warzone journalism.

          Decentralized • Permanent • Accessible
        </p>

        
        {/* Call to Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Button 
            onClick={handleStartExploring}
            size="lg"
            className="bg-white text-black hover:bg-gray-100 hover:text-black px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Exploring
          </Button>
          
          <Button 
            onClick={handleReadMore}
            size="lg"
            className="bg-white text-black hover:bg-gray-100 hover:text-black px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Learn About Public Goods
          </Button>
        </div>
        
        {/* Additional Info */}
        <div className="mt-16 text-sm text-gray-300 max-w-2xl">
          <p>
            Built on Filecoin's decentralized storage network, ensuring data permanence 
            and accessibility for researchers, developers, and the public.
          </p>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-8 text-white/30 text-sm">
        <p>Build: {typeof __BUILD_TIME__ !== 'undefined' 
          ? __BUILD_TIME__.slice(0, 19).replace('T', ' ')
          : 'Unknown'}
        </p>
      </div>
      
      <div className="absolute bottom-8 right-8 text-white/30 text-sm">
        <p>Filecoin Incentive Design Labs</p>
      </div>
    </div>
  );
};

export default LandingPage;
