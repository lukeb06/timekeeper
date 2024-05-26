import * as React from 'react';

import { cn } from '@/lib/utils';
import { useMediaQuery, query } from '@/hooks/use-media-query';
import { Button } from '@/Components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/Components/ui/dialog';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/Components/ui/drawer';

const EVENTS = ['', 'Clock In', 'Clock Out', 'Hours Edited'];

export default function ViewDetails({ children, daySummary }) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery(query.md);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<div>
						{daySummary.eventLog.length > 0 ? (
							<ul className="px-10 py-3">
								{[...daySummary.eventLog]
									.reverse()
									.map((event, index) => {
										return (
											<li key={index} className="mb-1">
												<div className="flex flex-row justify-between">
													<p>{EVENTS[event.type]}</p>
													<p>
														{new Date(
															event.timestamp,
														).toLocaleTimeString()}
													</p>
												</div>
											</li>
										);
									})}
							</ul>
						) : (
							<DialogDescription>
								No events recorded for this day.
							</DialogDescription>
						)}
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Details</DrawerTitle>
				</DrawerHeader>

				<div className="pb-10">
					{daySummary.eventLog.length > 0 ? (
						<ul className="px-10 py-3">
							{[...daySummary.eventLog]
								.reverse()
								.map((event, index) => {
									return (
										<li key={index} className="mb-1">
											<div className="flex flex-row justify-between">
												<p>{EVENTS[event.type]}</p>
												<p>
													{new Date(
														event.timestamp,
													).toLocaleTimeString()}
												</p>
											</div>
										</li>
									);
								})}
						</ul>
					) : (
						<DrawerDescription className="pb-10 px-5">
							No events recorded for this day.
						</DrawerDescription>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
