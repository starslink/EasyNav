import React from 'react';

interface SortOrderInputProps {
    value: number;
    onChange: (value: number) => void;
    error?: string;
}

export const SortOrderInput: React.FC<SortOrderInputProps> = ({
                                                                  value,
                                                                  onChange,
                                                                  error
                                                              }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                排序 (1-100)
            </label>
            <input
                type="number"
                min="1"
                max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#01D8B6] focus:border-transparent ${
                    error ? 'border-red-300' : ''
                }`}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};
