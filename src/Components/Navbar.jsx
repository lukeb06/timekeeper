import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from '@/Components/ui/navigation-menu';

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/Components/ui/sheet';

import { navigationMenuTriggerStyle } from '@/Components/ui/navigation-menu';

import { ModeToggle } from '@/Components/mode-toggle.jsx';
import { Button } from '@/Components/ui/button';

import { useMediaQuery, query } from '@/hooks/use-media-query.js';

import { Menu } from 'lucide-react';

const parseHref = href => {
	return `href="${href}"`;
};

const NavbarMenu = () => {
	const [currentPage, setCurrentPage] = useState(window.location.pathname);
	const useDesktop = useMediaQuery(query.md);

	useEffect(() => {
		setCurrentPage(parseHref(window.location.pathname));
	}, []);

	const setPage = e => {
		setCurrentPage(parseHref(e.target.getAttribute('href')));
	};

	return (
		<>
			<style>{`
                nav a[${currentPage}] {
                    position:relative;
                }

                nav a[${currentPage}]:not(.w-full):after {
                    content: '';
                    display: block;
                    height: 2px;
                    width: 80%;
                    background-color: hsl(var(--primary));
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    z-index:100;
                    transform:translateX(-50%);
                }

                nav a[${currentPage}].w-full {
                    border-color: hsl(var(--primary)) !important;
                }
            `}</style>

			<NavigationMenu className="md:sticky md:top-0 md:p-2 z-50 h-full md:h-fit w-fit md:w-full md:border-b md:border-border/40 md:bg-background/95 md:backdrop-blur md:supports-[backdrop-filter]:bg-background/60">
				<NavigationMenuList className="w-fit h-full md:h-fit md:w-full flex-col md:flex-row gap-3 overflow-y-auto md:overflow-y-hidden py-4 md:py-0">
					<NavigationMenuItem
						className={`!ml-0 ${useDesktop ? '' : 'w-full'}`}
					>
						<Button
							className={useDesktop ? '' : 'w-full'}
							onClick={setPage}
							asChild
							variant={useDesktop ? 'ghost' : 'outline'}
						>
							<Link to="/">Home</Link>
						</Button>
					</NavigationMenuItem>

					<div className="flex flex-grow flex-col-reverse md:flex-row-reverse">
						<NavigationMenuItem>
							<ModeToggle />
						</NavigationMenuItem>
					</div>
				</NavigationMenuList>
			</NavigationMenu>
		</>
	);
};

const MobileNavbar = ({ setPage }) => {
	return (
		<NavigationMenu className="sticky top-0 p-2 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<NavigationMenuList className="w-full justify-normal">
				<NavigationMenuItem>
					<Sheet>
						<Button asChild variant="outline" size="icon">
							<SheetTrigger>
								<Menu />
							</SheetTrigger>
						</Button>
						<SheetContent side="left">
							<NavbarMenu />
						</SheetContent>
					</Sheet>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
};

const Navbar = () => {
	const useDesktop = useMediaQuery(query.md);
	return useDesktop ? <NavbarMenu /> : <MobileNavbar />;
};

export default Navbar;
