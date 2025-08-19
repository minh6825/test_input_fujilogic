import React, { useState } from 'react';
import './PolygonCalculator.css';

interface Point {
  x: number;
  y: number;
}

interface Edge {
  index: number;
  length: number;
  from: Point;
  to: Point;
}

const PolygonCalculator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string>('');

  // Hàm tính khoảng cách giữa 2 điểm
  const calculateDistance = (point1: Point, point2: Point): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Hàm tính độ dài các cạnh của polygon
  const calculatePolygonEdges = (points: Point[]): Edge[] => {
    if (points.length < 2) {
      return [];
    }

    const calculatedEdges: Edge[] = [];
    
    // Tính độ dài từng cạnh (nối liên tiếp các điểm)
    for (let i = 0; i < points.length; i++) {
      const currentPoint = points[i];
      const nextPoint = points[(i + 1) % points.length]; // Nối điểm cuối với điểm đầu
      
      const length = calculateDistance(currentPoint, nextPoint);
      
      calculatedEdges.push({
        index: i + 1,
        length: Math.round(length * 100) / 100, // Làm tròn đến 2 chữ số thập phân
        from: currentPoint,
        to: nextPoint
      });
    }

    return calculatedEdges;
  };

  // Hàm xử lý khi người dùng nhấn nút tính toán
  const handleCalculate = () => {
    try {
      setError('');
      
    // Parse JSON từ textarea
    let points: Point[];
    try {
      points = JSON.parse(inputText);
    } catch (error) {
      try {
        const cleanedInput = inputText.replace(/\s+/g, ' ').trim();
        if (/^\[\s*\{\s*x\s*:.+\}\s*\]$/i.test(cleanedInput)) {
        points = new Function(`return ${inputText}`)();
        } else {
        throw new Error("Format không hợp lệ");
        }
      } catch (e) {
        throw new Error("Không thể parse dữ liệu. Hãy kiểm tra định dạng JSON");
      }
    }
      
      // Kiểm tra dữ liệu đầu vào
      if (!Array.isArray(points)) {
        throw new Error('Dữ liệu phải là một mảng');
      }
      
      if (points.length < 2) {
        throw new Error('Cần ít nhất 2 điểm để tạo thành polygon');
      }
      
      // Kiểm tra từng điểm có đúng format không
      points.forEach((point, index) => {
        if (typeof point.x !== 'number' || typeof point.y !== 'number') {
          throw new Error(`Điểm thứ ${index + 1} không hợp lệ. Mỗi điểm phải có x và y là số`);
        }
      });
      
      // Tính toán các cạnh
      const calculatedEdges = calculatePolygonEdges(points);
      setEdges(calculatedEdges);
      
    } catch (err) {
      setError(`Lỗi: ${err instanceof Error ? err.message : 'Dữ liệu không hợp lệ'}`);
      setEdges([]);
    }
  };

  // Hàm load dữ liệu mẫu
  const loadSampleData = () => {
    const sampleData = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 4 }
    ];
    setInputText(JSON.stringify(sampleData, null, 2));
  };

  return (
    <div className="polygon-calculator">
      <h1>Polygon Edge Calculator</h1>
      <p>Nhập dữ liệu điểm của polygon dưới dạng JSON:</p>
      
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Ví dụ: [{"x": 0, "y": 0}, {"x": 3, "y": 0}, {"x": 3, "y": 4}]'
          rows={8}
          cols={50}
        />
        
        <div className="buttons">
          <button onClick={handleCalculate}>Tính toán</button>
          <button onClick={loadSampleData} className="sample-btn">
            Load dữ liệu mẫu
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {edges.length > 0 && (
        <div className="results">
          <h2>Kết quả:</h2>
          <div className="edges-list">
            {edges.map((edge) => (
              <div key={edge.index} className="edge-item">
                <strong>Cạnh {edge.index}:</strong> {edge.length}
                <span className="edge-detail">
                  (từ ({edge.from.x}, {edge.from.y}) đến ({edge.to.x}, {edge.to.y}))
                </span>
              </div>
            ))}
          </div>
          
          <div className="total">
            <strong>Tổng chu vi: {edges.reduce((sum, edge) => sum + edge.length, 0).toFixed(2)}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolygonCalculator;
