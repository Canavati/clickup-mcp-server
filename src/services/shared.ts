/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Shared Services Module
 * 
 * This module maintains singleton instances of services that should be shared
 * across the application to ensure consistent state.
 */

import { createClickUpServices, ClickUpServices } from './clickup/index.js';
import config from '../config.js';
import { Logger } from '../logger.js';

const logger = new Logger('SharedServices');

// Singleton instances
let clickUpServicesInstance: ClickUpServices | null = null;

/**
 * Get or create the ClickUp services instance
 * Lazily creates services only when first accessed to avoid blocking server startup
 */
function getClickUpServices(): ClickUpServices {
  if (!clickUpServicesInstance) {
    logger.info('Creating shared ClickUp services singleton (lazy initialization)');

    // Create the services instance
    clickUpServicesInstance = createClickUpServices({
      apiKey: config.clickupApiKey,
      teamId: config.clickupTeamId
    });

    // Log what services were initialized with more clarity
    logger.info('Services initialization complete', {
      services: Object.keys(clickUpServicesInstance).join(', '),
      teamId: config.clickupTeamId
    });
  }
  return clickUpServicesInstance;
}

// Export lazy-loaded services object
// Services are only created when first accessed, not at module load time
export const clickUpServices = {
  get list() { return getClickUpServices().list; },
  get task() { return getClickUpServices().task; },
  get folder() { return getClickUpServices().folder; },
  get workspace() { return getClickUpServices().workspace; },
  get timeTracking() { return getClickUpServices().timeTracking; },
  get document() { return getClickUpServices().document; },
  get tag() { return getClickUpServices().tag; },
};

// Create module exports object for lazy individual service exports
const exports = {} as any;
Object.defineProperty(exports, 'listService', {
  get() { return getClickUpServices().list; }
});
Object.defineProperty(exports, 'taskService', {
  get() { return getClickUpServices().task; }
});
Object.defineProperty(exports, 'folderService', {
  get() { return getClickUpServices().folder; }
});
Object.defineProperty(exports, 'workspaceService', {
  get() { return getClickUpServices().workspace; }
});
Object.defineProperty(exports, 'timeTrackingService', {
  get() { return getClickUpServices().timeTracking; }
});
Object.defineProperty(exports, 'documentService', {
  get() { return getClickUpServices().document; }
});

export const {
  listService,
  taskService,
  folderService,
  workspaceService,
  timeTrackingService,
  documentService
} = exports;
