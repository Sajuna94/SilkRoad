import { useState } from 'react';
import styles from './QuantityInput.module.css';
import React from 'react';

type Props = {
	value?: number;
	min?: number;
	max?: number;
	onChange?: (value: number) => void;
};

export const QuantityInput = React.memo(
	React.forwardRef<HTMLInputElement, Props>(function QuantityInput(
		{ value = 1, min = 1, max = 99, onChange },
		ref
	) {
		const [internalValue, setInternalValue] = useState(value);
		const updateValue = (newValue: number) => {
			const clamped = Math.max(min, Math.min(max, newValue));
			setInternalValue(clamped);
			onChange?.(clamped);
		};
		return (
			<div className={styles.quantityInput}>
				<button onClick={() => updateValue(internalValue - 1)}>-</button>
				<input
					ref={ref}
					type="number"
					value={internalValue}
					onChange={(e) => updateValue(Number(e.target.value))}
				/>
				<button onClick={() => updateValue(internalValue + 1)}>+</button>
			</div>
		);
	})
);