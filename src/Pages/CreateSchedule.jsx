import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '@/hooks/use-store.jsx';

import { Button } from '@/Components/ui/button';

import { useNavigate } from 'react-router-dom';

import fetcher from '@/Utils/fetcher.js';

const CreateSchedule = () => {
	const navigate = useNavigate();

	const buttonRef = useRef();

	const [store, setStore] = useStore();

	const [inputs, setInputs] = useState([
		['09:00', '17:30'],
		['09:00', '17:30'],
		['09:00', '17:30'],
		['09:00', '17:30'],
		['09:00', '17:30'],
	]);

	const changeInput = (index, type, value) => {
		const newInputs = [...inputs];
		newInputs[index][type] = value;
		setInputs(newInputs);
	};

	const save = async () => {
		buttonRef.current.disabled = true;

		const response = await fetcher(
			`create-schedule/${Date.now()}?offset=${encodeURIComponent(store?.offset || 0)}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					schedule: inputs,
				}),
			},
		);

		buttonRef.current.disabled = false;

		if (response.error) {
			alert('An error occurred while saving the schedule.');
			return;
		}

		navigate('/schedule');
	};

	return (
		<div className="px-4 pt-4">
			<h1 className="text-center text-3xl">Create Schedule For:</h1>
			<h2 className="text-center text-2xl">
				{store.weekTitle || 'This Week'}
			</h2>

			<div className="flex flex-col gap-4">
				<DaySection
					label="Monday"
					index={0}
					changeInput={changeInput}
				/>
				<DaySection
					label="Tuesday"
					index={1}
					changeInput={changeInput}
				/>
				<DaySection
					label="Wednesday"
					index={2}
					changeInput={changeInput}
				/>
				<DaySection
					label="Thursday"
					index={3}
					changeInput={changeInput}
				/>
				<DaySection
					label="Friday"
					index={4}
					changeInput={changeInput}
				/>
			</div>

			<div className="flex flex-row justify-center mt-10 gap-10">
				<Button ref={buttonRef} onClick={save}>
					Save Schedule
				</Button>
				<Button
					onClick={() => {
						navigate('/schedule');
					}}
					variant="destructive"
				>
					Cancel
				</Button>
			</div>
		</div>
	);
};

const DaySection = ({ label, index, changeInput }) => {
	return (
		<div className="flex flex-col gap-1">
			<h3 className="text-center text-xl">{label}</h3>

			<div className="flex flex-row justify-around">
				<label>Start Time</label>
				<label>End Time</label>
			</div>

			<div className="flex flex-row justify-around">
				<input
					className="bg-primary text-primary-foreground min-w-[125px] text-center"
					type="time"
					defaultValue="09:00"
					min="08:00"
					max="18:00"
					onChange={e => {
						changeInput(index, 0, e.target.value);
					}}
				/>

				<input
					className="bg-primary text-primary-foreground min-w-[125px] text-center"
					type="time"
					defaultValue="17:30"
					min="08:00"
					max="18:00"
					onChange={e => {
						changeInput(index, 1, e.target.value);
					}}
				/>
			</div>
		</div>
	);
};

export default CreateSchedule;
