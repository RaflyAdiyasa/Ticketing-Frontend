// components/QRCodeGenerator.jsx
import { QRCodeSVG } from 'qrcode.react';
// atau jika mau pakai canvas:
// import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = ({ 
  value, 
  size = 128, 
  level = 'M', 
  includeMargin = false,
  bgColor = '#ffffff',
  fgColor = '#000000',
  className = ''
}) => {
  return (
    <div className={className}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        bgColor={bgColor}
        fgColor={fgColor}
      />
    </div>
  );
};

export default QRCodeGenerator;