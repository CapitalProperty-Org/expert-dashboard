import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { CheckCircle2, MinusCircle, Gauge } from 'lucide-react';
import type { IQualityScore } from '../../context/ListingsContext';

interface QualityScoreCircleProps {
  score?: number;
  qualityScore?: IQualityScore;
}

const QualityScoreCircle = ({ score, qualityScore }: QualityScoreCircleProps) => {
  const finalScore = qualityScore?.value ?? score ?? 0;
  const circumference = 2 * Math.PI * 18; // 2 * pi * r
  const offset = circumference - (finalScore / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s < 50) return 'text-red-500';
    if (s < 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getBgColor = (s: number) => {
    if (s < 50) return 'bg-red-100/50 text-red-600';
    if (s < 70) return 'bg-yellow-100/50 text-yellow-600';
    return 'bg-green-100/50 text-green-600';
  };

  const scoreColor = getScoreColor(finalScore);

  const getIcon = (color: string) => {
    switch (color) {
      case 'green':
        return <CheckCircle2 className="w-4 h-4 text-green-500 fill-current" />;
      case 'orange':
      case 'yellow':
        return <MinusCircle className="w-4 h-4 text-yellow-400 fill-current" />; // Using yellow-400 for better visibility
      case 'red':
        return <MinusCircle className="w-4 h-4 text-red-500 fill-current" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  // Custom styled icons to match the image (solid circle with white icon inside)
  // Actually CheckCircle2 and MinusCircle are outlines by default in Lucide.
  // To match the image exactly (solid color circle, white symbol), we can use:
  // fill-{color} text-white

  const getStatusIcon = (color: string) => {
    if (color === 'green') {
      return <CheckCircle2 className="w-5 h-5 fill-green-500 text-white" strokeWidth={3} />; // Green solid check
    } else if (color === 'orange' || color === 'yellow') {
      return <MinusCircle className="w-5 h-5 fill-yellow-400 text-white" strokeWidth={3} />; // Yellow solid dash
    } else {
      return <MinusCircle className="w-5 h-5 fill-red-500 text-white" strokeWidth={3} />; // Red solid dash
    }
  };


  const renderTooltipContent = () => {
    if (!qualityScore?.details) return null;

    const { details } = qualityScore;

    const sectionLabels: Record<string, string> = {
      description: 'Description',
      image: 'Images',
      image_diversity: 'Image Diversity',
      image_duplicates: 'Image Duplicates',
      images_dimensions: 'Images Dimensions',
      location: 'Location',
      title: 'Title',
      verified: 'Listing verification'
    };

    // Define separate groups to match the image layout
    const group1 = ['description'];
    const group2 = ['image', 'image_diversity', 'image_duplicates', 'images_dimensions'];
    const group3 = ['location', 'title'];
    const group4 = ['verified'];

    const groups = [group1, group2, group3, group4];

    const renderRow = (key: string) => {
      const detail = details[key];
      if (!detail) return null;

      return (
        <div key={key} className="flex items-center justify-between py-1.5 gap-4">
          <span className="text-gray-700 font-medium text-sm">{sectionLabels[key] || key}</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(detail.color)}
            <span className="text-gray-700 font-semibold text-sm">
              {detail.tag === 'Ok' || detail.tag === 'Good' || detail.tag === 'Short' || detail.tag === 'No' || detail.tag === 'Yes'
                ? <><span className={detail.color === 'green' ? 'text-green-600' : 'text-gray-900'}>{detail.value}</span><span className="text-gray-400 text-xs">/{detail.weight}</span></>
                : detail.tag
              }
            </span>
          </div>
        </div>
      );
    };

    // Helper to fix the tag display. The image shows "10/10", "6/6". 
    // The backend 'tag' might be "Ok", "Short", "0 / 30".
    // But the image explicitly shows Score/Max. 
    // The backend `value` is the score, `weight` is the max.
    // So I should construct the "10/10" string from value and weight.

    const renderRowWithScore = (key: string) => {
      const detail = details[key];
      if (!detail) return null;

      return (
        <div key={key} className="flex items-center justify-between py-1.5 gap-4">
          <span className="text-gray-700 font-medium text-sm text-[13px]">{sectionLabels[key] || key}</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(detail.color)}
            <div className="font-bold text-sm min-w-[36px] text-right">
              <span className="text-gray-800">{detail.value}</span>
              <span className="text-gray-400 text-xs font-normal">/{detail.weight}</span>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white p-4 rounded-xl shadow-xl min-w-[280px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Quality score</h3>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${getBgColor(finalScore)}`}>
            <Gauge size={16} />
            <span className="font-bold text-sm">{finalScore}/100</span>
          </div>
        </div>

        {groups.map((group, groupIndex) => {
          const items = group.map(key => renderRowWithScore(key)).filter(Boolean);
          if (items.length === 0) return null;

          return (
            <div key={groupIndex}>
              {groupIndex > 0 && <div className="border-t border-dashed border-gray-200 my-2" />}
              <div className="flex flex-col">
                {items}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // If no details, just return the circle without tooltip or with simple tooltip
  if (!qualityScore?.details) {
    return (
      <div className="relative h-12 w-12 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 40 40">
          <circle
            className="text-gray-200"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r="18"
            cx="20"
            cy="20"
          />
          <circle
            className={scoreColor}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="18"
            cx="20"
            cy="20"
            transform="rotate(-90 20 20)"
          />
        </svg>
        <span className={`absolute text-xs font-bold ${scoreColor}`}>
          {finalScore}%
        </span>
      </div>
    );
  }

  return (
    <Tippy
      content={renderTooltipContent()}
      interactive={true}
      placement="right"
      theme="light"
      maxWidth={350}
      offset={[0, 10]}
      appendTo={document.body}
    >
      <div className="relative h-12 w-12 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
        <svg className="w-full h-full" viewBox="0 0 40 40">
          <circle
            className="text-gray-200"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r="18"
            cx="20"
            cy="20"
          />
          <circle
            className={scoreColor}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="18"
            cx="20"
            cy="20"
            transform="rotate(-90 20 20)"
          />
        </svg>
        <span className={`absolute text-xs font-bold ${scoreColor}`}>
          {finalScore}%
        </span>
      </div>
    </Tippy>
  );
};

export default QualityScoreCircle;