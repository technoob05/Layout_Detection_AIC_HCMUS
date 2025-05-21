import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Network, ZoomIn, ZoomOut, Maximize, Minimize, Download } from 'lucide-react';
import { PdfMindMap, MindMapNode } from '../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MindMapPanelProps {
  mindMap: PdfMindMap | undefined;
  isLoading: boolean;
  onGenerate: () => void;
}

export function MindMapPanel({ mindMap, isLoading, onGenerate }: MindMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Function to export mind map as SVG
  const exportAsSVG = () => {
    if (!containerRef.current) return;
    
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;
    
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
        <h3 className="font-medium text-lg mb-2">Generating Mind Map</h3>
        <p className="text-muted-foreground text-sm">
          Analyzing the document structure and creating visualization...
        </p>
      </div>
    );
  }

  if (!mindMap) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <Network className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No Mind Map Available</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Generate a mind map to visualize key concepts and relationships in this document.
        </p>
        <Button onClick={onGenerate}>
          Generate Mind Map
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Document Mind Map</h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={exportAsSVG}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onGenerate}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="border rounded-md overflow-auto bg-muted/20 p-4 h-[calc(100vh-200px)]"
        style={{
          position: isFullscreen ? 'fixed' : 'relative',
          inset: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 50 : 'auto',
          backgroundColor: isFullscreen ? 'white' : '',
        }}
      >
        <div className="min-w-[800px] min-h-[500px] flex items-center justify-center"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          <MindMapVisualizer rootNode={mindMap.rootNode} />
        </div>
      </div>
    </div>
  );
}

interface MindMapVisualizerProps {
  rootNode: MindMapNode;
}

function MindMapVisualizer({ rootNode }: MindMapVisualizerProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(500, 300)">
          <MindMapNodeComponent node={rootNode} x={0} y={0} level={0} angleSpread={360} />
        </g>
      </svg>
    </div>
  );
}

interface MindMapNodeProps {
  node: MindMapNode;
  x: number;
  y: number;
  level: number;
  angleSpread: number;
  startAngle?: number;
}

function MindMapNodeComponent({ node, x, y, level, angleSpread, startAngle = 0 }: MindMapNodeProps) {
  const radius = 200 / (level + 1.5);
  const childCount = node.children?.length || 0;
  
  // Calculate colors based on level
  const getNodeColor = (level: number) => {
    const colors = [
      'rgba(var(--primary), 0.8)',      // Level 0 (root)
      'rgba(var(--primary), 0.65)',     // Level 1
      'rgba(var(--primary), 0.5)',      // Level 2
      'rgba(var(--primary), 0.35)',     // Level 3+
    ];
    return colors[Math.min(level, colors.length - 1)];
  };
  
  // Calculate text size based on level
  const getTextSize = (level: number) => {
    const sizes = [16, 14, 12, 10];
    return sizes[Math.min(level, sizes.length - 1)];
  };

  // Render the children nodes recursively
  const renderChildren = () => {
    if (!node.children || node.children.length === 0) return null;
    
    const angleStep = angleSpread / childCount;
    const childRadius = radius * (level === 0 ? 2 : 1.3);
    
    return node.children.map((child, i) => {
      const childAngle = startAngle + angleStep * i + angleStep / 2;
      const childAngleRad = (childAngle * Math.PI) / 180;
      const childX = x + Math.cos(childAngleRad) * childRadius;
      const childY = y + Math.sin(childAngleRad) * childRadius;
      
      // Calculate the line to the child
      const lineStyle = {
        stroke: 'rgba(var(--muted-foreground), 0.3)',
        strokeWidth: Math.max(3 - level * 0.8, 0.5),
      };
      
      return (
        <g key={child.id}>
          <line 
            x1={x} 
            y1={y} 
            x2={childX} 
            y2={childY} 
            style={lineStyle} 
          />
          <MindMapNodeComponent 
            node={child} 
            x={childX} 
            y={childY} 
            level={level + 1} 
            angleSpread={angleStep} 
            startAngle={childAngle - angleStep / 2} 
          />
        </g>
      );
    });
  };

  return (
    <>
      {/* Circle for the node */}
      <circle 
        cx={x} 
        cy={y} 
        r={Math.max(15 - level * 3, 7)} 
        fill={getNodeColor(level)} 
        stroke="rgba(var(--border), 0.5)"
        strokeWidth="1"
      />
      
      {/* Label for the node */}
      <foreignObject
        x={x - 60}
        y={y + (level === 0 ? 20 : 15)}
        width="120"
        height="50"
        style={{
          textAlign: 'center',
          overflow: 'visible',
        }}
      >
        <div 
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: level === 0 ? 'rgba(var(--primary), 0.1)' : 'transparent',
            borderRadius: '4px',
            fontSize: `${getTextSize(level)}px`,
            fontWeight: level === 0 ? 'bold' : 'normal',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.label}
        </div>
      </foreignObject>
      
      {/* Render children recursively */}
      {renderChildren()}
    </>
  );
} 