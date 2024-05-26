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

export default function EditHours({ children, daySummary }) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery(query.md);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]"></DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Edit Hours</DrawerTitle>
				</DrawerHeader>
			</DrawerContent>
		</Drawer>
	);
}
