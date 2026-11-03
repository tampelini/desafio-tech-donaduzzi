import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { MotionGlobalConfig } from 'framer-motion';

// Animações desligadas nos testes para transições instantâneas.
MotionGlobalConfig.skipAnimations = true;
