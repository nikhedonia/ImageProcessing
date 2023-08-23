export function getValue({type, value, checked}: HTMLInputElement) {
    switch(type){
      case 'checkbox': return checked;
      case 'range': return  +(value || 0);
      case 'number': return  +(value || 0);
      default : return  value;
    }
  }