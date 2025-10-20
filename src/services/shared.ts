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

// Export lazy-loaded services object using Proxy pattern
// Proxies defer service creation until methods are actually called, not when destructured
// This allows module-level destructuring (e.g., const { task } = clickUpServices) without triggering initialization
// Services are only created when tool methods are invoked (e.g., task.createTask(...))
export const clickUpServices = {
  list: new Proxy({} as any, {
    get(_target, prop) { return getClickUpServices().list[prop]; }
  }),
  task: new Proxy({} as any, {
    get(_target, prop) { return getClickUpServices().task[prop]; }
  }),
  folder: new Proxy({} as any, {
    get(_target, prop) { return getClickUpServices().folder[prop]; }
  }),
  workspace: new Proxy({} as any, {
    get(_target, prop) { return getClickUpServices().workspace[prop]; }
  }),
  timeTracking: new Proxy({} as any, {
    get(_target, prop) { return getClickUpServices().timeTracking[prop]; }
  }),
  document: new Proxy({} as any, {
    get(_target, prop) { return getClickUpServices().document[prop]; }
  }),
  tag: new Proxy({} as any, {
    get(_target, prop) { return getClickUpServices().tag[prop]; }
  }),
};

// Export individual service proxies for backward compatibility
// Each is a Proxy that directly calls getClickUpServices() to maintain lazy initialization
export const listService = new Proxy({} as any, {
  get(_target, prop) { return getClickUpServices().list[prop]; }
});
export const taskService = new Proxy({} as any, {
  get(_target, prop) { return getClickUpServices().task[prop]; }
});
export const folderService = new Proxy({} as any, {
  get(_target, prop) { return getClickUpServices().folder[prop]; }
});
export const workspaceService = new Proxy({} as any, {
  get(_target, prop) { return getClickUpServices().workspace[prop]; }
});
export const timeTrackingService = new Proxy({} as any, {
  get(_target, prop) { return getClickUpServices().timeTracking[prop]; }
});
export const documentService = new Proxy({} as any, {
  get(_target, prop) { return getClickUpServices().document[prop]; }
});
