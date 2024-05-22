import React, { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

const LoadSpinner = () => {
    return (
        <div className="svg-spinner">
            <LoaderCircle />
        </div>
    );
};

export default LoadSpinner;
