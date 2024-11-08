import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WatermarkProps {
  username: string;
}

export const Watermark: React.FC<WatermarkProps> = ({ username }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const watermarks = [];
  const watermarkWidth = 200; // 每个水印的宽度
  const watermarkHeight = 100; // 每个水印的高度
  const diagonalSpacing = 100; // 对角线方向的间距
  
  // 计算需要的列数和行数以覆盖整个屏幕
  // 由于是斜向排列，我们需要额外的列和行来确保覆盖
  const columnsNeeded = Math.ceil(dimensions.width / (watermarkWidth * 0.5)) + 2;
  const rowsNeeded = Math.ceil(dimensions.height / (watermarkHeight * 0.5)) + 2;
  
  for (let col = -2; col < columnsNeeded; col++) {
    for (let row = -2; row < rowsNeeded; row++) {
      // 计算每个水印的位置，使其形成斜向排列
      const x = col * watermarkWidth - (row * diagonalSpacing * 0.5);
      const y = row * watermarkHeight * 0.5;
      
      watermarks.push(
        <motion.div
          key={`watermark-${col}-${row}`}
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ delay: (col + row) * 0.01 }}
          style={{
            left: x,
            top: y,
            transform: 'rotate(-30deg)',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#000000',
            whiteSpace: 'nowrap',
            width: watermarkWidth,
            height: watermarkHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {username}
        </motion.div>
      );
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-50">
      {watermarks}
    </div>
  );
};