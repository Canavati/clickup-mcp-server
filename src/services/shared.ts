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

// Export individual service proxies for backward compatibility
// Each is a Proxy that forwards property access to clickUpServices
// This maintains lazy initialization - services only created when actually used
export const listService = new Proxy({} as any, {
  get(_target, prop) { return clickUpServices.list[prop]; }
});
export const taskService = new Proxy({} as any, {
  get(_target, prop) { return clickUpServices.task[prop]; }
});
export const folderService = new Proxy({} as any, {
  get(_target, prop) { return clickUpServices.folder[prop]; }
});
export const workspaceService = new Proxy({} as any, {
  get(_target, prop) { return clickUpServices.workspace[prop]; }
});
export const timeTrackingService = new Proxy({} as any, {
  get(_target, prop) { return clickUpServices.timeTracking[prop]; }
});
export const documentService = new Proxy({} as any, {
  get(_target, prop) { return clickUpServices.document[prop]; }
});
