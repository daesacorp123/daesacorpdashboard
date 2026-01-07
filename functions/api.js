// functions/api.js - SUPER SIMPLE NO DEPENDENCIES
exports.handler = async function(event, context) {
  try {
    console.log('API Function called:', event.path);
    
    // Parse the endpoint from path
    const path = event.path;
    let endpoint = '';
    
    if (path.includes('/.netlify/functions/api')) {
      endpoint = path.replace('/.netlify/functions/api', '');
    } else if (path.includes('/api')) {
      endpoint = path.replace('/api', '');
    } else {
      endpoint = path;
    }
    
    // Remove leading/trailing slashes
    endpoint = endpoint.replace(/^\/|\/$/g, '');
    
    console.log('Endpoint requested:', endpoint);
    
    // Helper untuk generate data
    const generateData = (base, variation = 0.05) => {
      const change = base * variation * (Math.random() > 0.5 ? 1 : -1);
      return Math.round(base + change);
    };
    
    let responseData;
    
    // Route based on endpoint
    switch(endpoint) {
      case 'dashboard/overview':
      case '':
        responseData = {
          success: true,
          endpoint: 'dashboard/overview',
          data: {
            total_spend: generateData(12500000),
            total_conversions: generateData(1248),
            roas: (Math.random() * 2 + 3).toFixed(1),
            ctr: (Math.random() * 1 + 3).toFixed(1) + '%',
            performance_trend: 'up',
            trend_percentage: '12.5',
            timestamp: new Date().toISOString()
          }
        };
        break;
        
      case 'platforms':
        responseData = {
          success: true,
          endpoint: 'platforms',
          data: [
            {
              id: 'fb',
              name: 'Facebook',
              spend: generateData(7500000),
              conversions: generateData(685),
              ctr: '2.5%',
              cpc: generateData(2400),
              performance: 'good',
              color: '#1877f2'
            },
            {
              id: 'google',
              name: 'Google',
              spend: generateData(5000000),
              conversions: generateData(563),
              ctr: '2.25%',
              cpc: generateData(1850),
              performance: 'good',
              color: '#34a853'
            }
          ]
        };
        break;
        
      case 'realtime/updates':
        responseData = {
          success: true,
          endpoint: 'realtime/updates',
          data: {
            events: [
              { 
                type: 'conversion', 
                value: generateData(150), 
                platform: 'Facebook', 
                time: '2 minutes ago',
                timestamp: new Date().toISOString()
              },
              { 
                type: 'click', 
                value: generateData(1200), 
                platform: 'Google', 
                time: '5 minutes ago',
                timestamp: new Date().toISOString()
              }
            ]
          }
        };
        break;
        
      case 'health':
        responseData = {
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        };
        break;
        
      default:
        responseData = {
          success: false,
          error: 'Endpoint not found',
          requested: endpoint,
          available: [
            'dashboard/overview',
            'platforms', 
            'realtime/updates',
            'health'
          ]
        };
    }
    
    // Return response
    return {
      statusCode: responseData.success ? 200 : 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(responseData, null, 2)
    };
    
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }
};