import '@testing-library/jest-dom/vitest';

window.scrollTo = () => {};
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
