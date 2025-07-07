import { create } from 'zustand';

const useLocationStore = create((set, get) => ({
  // State for location
  currentLocation: "San Antón",
  latitude: null,
  longitude: null,
  locationLoading: false,
  locationError: null,
  
  // Function to get location name from coordinates
  getLocationName: async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required) - This is the same as in SiteHeaderCustomer
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Extract city, town, or locality
        const location = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.hamlet || 
                        data.address.suburb ||
                        data.address.state ||
                        "Ubicación desconocida";
        return location;
      }
      return "Ubicación encontrada";
    } catch (error) {
      console.error("Error getting location name:", error);
      return "Ubicación encontrada";
    }
  },

  // Main function to get user's location
  getCurrentLocation: () => {
    set({ locationLoading: true, locationError: null });

    if (!navigator.geolocation) {
      set({ 
        locationError: "La geolocalización no es compatible con este navegador",
        locationLoading: false 
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // Cache for 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log("Ubicación obtenida:", latitude, longitude);
          
          // Get human-readable location name
          const locationName = await get().getLocationName(latitude, longitude);
          
          // Update store state
          set({ 
            currentLocation: locationName,
            latitude,
            longitude,
            locationLoading: false,
            locationError: null
          });
          
          // Save to localStorage
          localStorage.setItem('userLocation', JSON.stringify({
            latitude,
            longitude,
            name: locationName,
            timestamp: Date.now()
          }));
          
        } catch (error) {
          console.error("Error processing location:", error);
          set({ 
            locationError: "Error al procesar la ubicación",
            locationLoading: false 
          });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Error al obtener la ubicación";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permisos de ubicación denegados";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado";
            break;
        }
        
        set({ 
          locationError: errorMessage,
          locationLoading: false 
        });
      },
      options
    );
  },

  // Function to load saved location from localStorage
  loadSavedLocation: () => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const { name, latitude, longitude, timestamp } = JSON.parse(savedLocation);
        // Use saved location if it's less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          set({ 
            currentLocation: name,
            latitude,
            longitude
          });
        }
      } catch (error) {
        console.error("Error loading saved location:", error);
      }
    }
  },

  // Function to clear errors
  clearLocationError: () => {
    set({ locationError: null });
  },

  // Function to manually set a location
  setLocation: (location, latitude = null, longitude = null) => {
    set({ 
      currentLocation: location,
      latitude,
      longitude,
      locationError: null
    });
    
    // Save to localStorage if coordinates are provided
    if (latitude && longitude) {
      localStorage.setItem('userLocation', JSON.stringify({
        latitude,
        longitude,
        name: location,
        timestamp: Date.now()
      }));
    }
  }
}));

export default useLocationStore; 