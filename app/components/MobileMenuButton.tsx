import React from 'react';
import { Button } from './your-component-library'; // Adjust the import based on your component library
import { Menu } from 'your-icon-library'; // Adjust the import based on your icon library

const MobileMenuButton = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    return (
        <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
            <Menu />
        </Button>
    );
};

export default MobileMenuButton;
