import { useEffect, useState, useRef } from "react";

interface ContainerDimensions {
  width: number;
  height: number;
  inlineSize: number;
  blockSize: number;
}

type QueryCondition = {
  property: 'width' | 'height' | 'inline-size' | 'block-size' | 'aspect-ratio';
  operator: '<=' | '>=' | '=' | '<' | '>';
  value: number;
  unit?: 'px' | 'em' | 'rem' | '%';
};

export const useContainerQuery = <T extends HTMLElement = HTMLElement>(query: string) => {
  const [isMatched, setIsMatched] = useState(false);
  const ref = useRef<T>(null);

  // Parse container query string
  const parseQuery = (queryString: string): QueryCondition[] => {
    const conditions: QueryCondition[] = [];

    // Remove parentheses and split by 'and'
    const cleanQuery = queryString.replace(/[()]/g, '').trim();
    const parts = cleanQuery.split(/\s+and\s+/i);

    parts.forEach(part => {
      const trimmed = part.trim();

      // Match patterns like:
      // max-width: 130px
      // min-height: 200px
      // width >= 300px
      // aspect-ratio: 16/9

      // Pattern 1: max-/min- prefix
      const maxMinMatch = trimmed.match(/^(max|min)-(width|height|inline-size|block-size):\s*(\d+(?:\.\d+)?)(px|em|rem|%)?$/i);
      if (maxMinMatch) {
        const [, minMax, property, value, unit] = maxMinMatch;
        conditions.push({
          property: property as any,
          operator: minMax === 'max' ? '<=' : '>=',
          value: parseFloat(value),
          unit: unit as any || 'px'
        });
        return;
      }

      // Pattern 2: Direct comparison (width >= 300px)
      const comparisonMatch = trimmed.match(/^(width|height|inline-size|block-size)\s*([<>=]+)\s*(\d+(?:\.\d+)?)(px|em|rem|%)?$/i);
      if (comparisonMatch) {
        const [, property, operator, value, unit] = comparisonMatch;
        conditions.push({
          property: property as any,
          operator: operator as any,
          value: parseFloat(value),
          unit: unit as any || 'px'
        });
        return;
      }

      // Pattern 3: Aspect ratio
      const aspectRatioMatch = trimmed.match(/^(max-|min-)?aspect-ratio:\s*(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/i);
      if (aspectRatioMatch) {
        const [, minMax, numerator, denominator] = aspectRatioMatch;
        const ratio = parseFloat(numerator) / (denominator ? parseFloat(denominator) : 1);
        conditions.push({
          property: 'aspect-ratio',
          operator: minMax === 'max-' ? '<=' : minMax === 'min-' ? '>=' : '=',
          value: ratio
        });
        return;
      }

      console.warn(`Could not parse container query condition: ${trimmed}`);
    });

    return conditions;
  };

  // Convert units to pixels
  const convertToPixels = (value: number, unit: string = 'px'): number => {
    switch (unit) {
      case 'px':
        return value;
      case 'em':
        // Approximate: 1em = 16px (would need actual computed font-size for precision)
        return value * 16;
      case 'rem':
        // Approximate: 1rem = 16px (would need actual root font-size for precision)
        return value * 16;
      case '%':
        // For percentage, we'd need to know which dimension we're measuring against
        // This is a simplified implementation - returning as-is
        return value;
      default:
        return value;
    }
  };

  // Evaluate a single condition
  const evaluateCondition = (condition: QueryCondition, dimensions: ContainerDimensions): boolean => {
    let currentValue: number;

    switch (condition.property) {
      case 'width':
      case 'inline-size':
        currentValue = dimensions.width;
        break;
      case 'height':
      case 'block-size':
        currentValue = dimensions.height;
        break;
      case 'aspect-ratio':
        currentValue = dimensions.width / dimensions.height;
        break;
      default:
        return false;
    }

    const targetValue = condition.unit && condition.property !== 'aspect-ratio'
      ? convertToPixels(condition.value, condition.unit)
      : condition.value;

    switch (condition.operator) {
      case '<=':
        return currentValue <= targetValue;
      case '>=':
        return currentValue >= targetValue;
      case '=':
        return Math.abs(currentValue - targetValue) < 0.01; // Float comparison tolerance
      case '<':
        return currentValue < targetValue;
      case '>':
        return currentValue > targetValue;
      default:
        return false;
    }
  };

  useEffect(() => {
    if (!ref.current) return;

    const conditions = parseQuery(query);
    if (conditions.length === 0) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;

      const dimensions: ContainerDimensions = {
        width,
        height,
        inlineSize: width,  // In LTR languages, inline-size = width
        blockSize: height   // In LTR languages, block-size = height
      };

      // All conditions must be true (AND logic)
      const allMatch = conditions.every(condition =>
        evaluateCondition(condition, dimensions)
      );

      setIsMatched(allMatch);
    });

    observer.observe(ref.current);

    // Initial check
    const rect = ref.current.getBoundingClientRect();
    const initialDimensions: ContainerDimensions = {
      width: rect.width,
      height: rect.height,
      inlineSize: rect.width,
      blockSize: rect.height
    };

    const initialMatch = conditions.every(condition =>
      evaluateCondition(condition, initialDimensions)
    );
    setIsMatched(initialMatch);

    return () => observer.disconnect();
  }, [query]);

  return { isMatched, ref };
};

// Usage examples:
// const { isMatched, ref } = useContainerQuery('max-width: 130px');
// const { isMatched, ref } = useContainerQuery('min-width: 200px and max-height: 400px');
// const { isMatched, ref } = useContainerQuery('width >= 300px');
// const { isMatched, ref } = useContainerQuery('aspect-ratio: 16/9');
// const { isMatched, ref } = useContainerQuery('max-aspect-ratio: 1.5');

// Then use it like:
// <div ref={ref}>
//   <span className={isMatched ? 'hidden' : ''}>
//     {label}
//   </span>
// </div>
