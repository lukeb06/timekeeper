import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/hooks/use-store.jsx';

const Navbar = () => {
	const [store, setStore] = useStore();

	return <nav className="border-t border-t-accent h-12"></nav>;
};

export default Navbar;
