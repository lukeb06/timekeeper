import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/global.css';
import '@/index.scss';

import { ThemeProvider } from '@/Components/theme-provider.jsx';
import { StoreProvider } from '@/hooks/use-store.jsx';
import { LocalStorageProvider } from '@/hooks/use-local-storage.jsx';

import App from '@/Pages/App.jsx';
import SchedulePage from '@/Pages/SchedulePage.jsx';
import CreateSchedule from '@/Pages/CreateSchedule.jsx';

import Navbar from '@/Components/Navbar';

const ROOT = document.getElementById('root');

const ROUTER = (
	<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
		<StoreProvider>
			<LocalStorageProvider>
				<BrowserRouter>
					<div className="h-full flex flex-col">
						<main className="overflow-y-hidden flex-grow flex flex-col">
							<Routes>
								<Route path="/" element={<App />} />
								<Route
									path="/schedule"
									element={<SchedulePage />}
								/>
								<Route
									path="/schedule/create"
									element={<CreateSchedule />}
								/>
							</Routes>
						</main>
						{/* <footer className="h-fit">
							<Navbar />
						</footer> */}
					</div>
				</BrowserRouter>
			</LocalStorageProvider>
		</StoreProvider>
	</ThemeProvider>
);

if (ROOT.hasChildNodes()) {
	ReactDOM.hydrateRoot(ROUTER, ROOT);
} else {
	ReactDOM.createRoot(ROOT).render(ROUTER);
}
