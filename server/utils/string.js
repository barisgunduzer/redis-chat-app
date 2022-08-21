const trMap = {
  Ç: 'C',
  Ğ: 'G',
  İ: 'I',
  Ö: 'O',
  Ş: 'S',
  Ü: 'U',
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
};

export const sanitise = (text) => {
  let sanitisedText = text;
  if (text.indexOf('<') > -1 || text.indexOf('>') > -1) {
    sanitisedText = text.replace(/</g, '&lt').replace(/>/g, '&gt');
  }
  return sanitisedText;
};

export const convertValidUsername = (text) => {
  let convertedText = text;
  for (const key in trMap) {
    convertedText = convertedText.replace(key, trMap[key]);
  }
  return convertedText.toLowerCase();
};
