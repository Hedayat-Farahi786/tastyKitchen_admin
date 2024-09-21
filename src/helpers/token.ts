export const decodeToken = (token: string) => {
    try {
      const [, payload] = token.split('.');
      if (!payload) {
        throw new Error('Invalid token');
      }
      let output = payload.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw new Error('Invalid base64 string');
    }
      const decodedPayload = decodeURIComponent(escape(atob(output)));
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  };