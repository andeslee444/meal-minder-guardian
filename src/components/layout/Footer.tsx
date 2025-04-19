import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, GithubIcon, TwitterIcon, HeartIcon } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 py-8 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-kitchen-500" />
              <span className="text-lg font-display font-semibold">KitchenBuddy</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              Reduce food waste, save money, and streamline meal planning with our intelligent
              kitchen management system.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/inventory"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Recipe Recommendations
                </Link>
              </li>
              <li>
                <Link
                  to="/expenses"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Expense Tracking
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center">
            Made with <HeartIcon className="w-4 h-4 text-red-500 mx-1" /> for a healthier planet
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
