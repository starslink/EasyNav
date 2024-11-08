import { dbConfig } from './config.js';

export function getQueries() {
  if (dbConfig.type === 'mysql') {
    return {
      // Users
      findUserByUsername: 'SELECT * FROM users WHERE username = ? OR email = ?',
      findUserById: 'SELECT * FROM users WHERE id = ?',
      createUser: 'INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)',
      verifyUser: 'UPDATE users SET is_active = TRUE, verification_token = NULL, modified_at = CURRENT_TIMESTAMP WHERE id = ?',

      // Groups
      getAllGroups: 'SELECT * FROM `groups` ORDER BY sort_order ASC, created_at DESC',
      findGroupById: 'SELECT * FROM `groups` WHERE id = ?',
      createGroup: 'INSERT INTO `groups` (id, name, icon, sort_order) VALUES (?, ?, ?, ?)',
      updateGroup: 'UPDATE `groups` SET name = ?, icon = ?, sort_order = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?',
      deleteGroup: 'DELETE FROM `groups` WHERE id = ?',
      checkSortOrder: 'SELECT id FROM `groups` WHERE sort_order = ? AND id != ?',

      // Subgroups
      getSubgroupsByGroupId: 'SELECT * FROM subgroups WHERE group_id = ? ORDER BY sort_order ASC, created_at DESC',
      findSubgroupById: 'SELECT * FROM subgroups WHERE id = ?',
      createSubgroup: 'INSERT INTO subgroups (id, name, group_id, sort_order) VALUES (?, ?, ?, ?)',
      updateSubgroup: 'UPDATE subgroups SET name = ?, sort_order = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?',
      deleteSubgroup: 'DELETE FROM subgroups WHERE id = ?',
      checkSubgroupSortOrder: 'SELECT id FROM subgroups WHERE group_id = ? AND sort_order = ? AND id != ?',

      // Links
      getAllLinks: 'SELECT * FROM links ORDER BY created_at DESC',
      getLinksByGroup: 'SELECT * FROM links WHERE group_id = ? ORDER BY created_at DESC',
      getLinksByGroupAndSubgroup: 'SELECT * FROM links WHERE group_id = ? AND subgroup_id = ? ORDER BY created_at DESC',
      createLink: 'INSERT INTO links (id, title, subtitle, url, icon, group_id, subgroup_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      updateLink: 'UPDATE links SET title = ?, subtitle = ?, url = ?, icon = ?, group_id = ?, subgroup_id = ?, modified_at = CURRENT_TIMESTAMP WHERE id = ?',
      deleteLink: 'DELETE FROM links WHERE id = ?'
    };
  } else {
    return {
      // Users
      findUserByUsername: 'SELECT * FROM users WHERE username = ? OR email = ?',
      findUserById: 'SELECT * FROM users WHERE id = ?',
      createUser: 'INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)',
      verifyUser: 'UPDATE users SET is_active = TRUE, verification_token = NULL WHERE id = ?',

      // Groups
      getAllGroups: 'SELECT * FROM groups ORDER BY sort_order ASC, created_at DESC',
      findGroupById: 'SELECT * FROM groups WHERE id = ?',
      createGroup: 'INSERT INTO groups (id, name, icon, sort_order) VALUES (?, ?, ?, ?)',
      updateGroup: 'UPDATE groups SET name = ?, icon = ?, sort_order = ? WHERE id = ?',
      deleteGroup: 'DELETE FROM groups WHERE id = ?',
      checkSortOrder: 'SELECT id FROM groups WHERE sort_order = ? AND id != ?',

      // Subgroups
      getSubgroupsByGroupId: 'SELECT * FROM subgroups WHERE group_id = ? ORDER BY sort_order ASC, created_at DESC',
      findSubgroupById: 'SELECT * FROM subgroups WHERE id = ?',
      createSubgroup: 'INSERT INTO subgroups (id, name, group_id, sort_order) VALUES (?, ?, ?, ?)',
      updateSubgroup: 'UPDATE subgroups SET name = ?, sort_order = ? WHERE id = ?',
      deleteSubgroup: 'DELETE FROM subgroups WHERE id = ?',
      checkSubgroupSortOrder: 'SELECT id FROM subgroups WHERE group_id = ? AND sort_order = ? AND id != ?',

      // Links
      getAllLinks: 'SELECT * FROM links ORDER BY created_at DESC',
      getLinksByGroup: 'SELECT * FROM links WHERE group_id = ? ORDER BY created_at DESC',
      getLinksByGroupAndSubgroup: 'SELECT * FROM links WHERE group_id = ? AND subgroup_id = ? ORDER BY created_at DESC',
      createLink: 'INSERT INTO links (id, title, subtitle, url, icon, group_id, subgroup_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      updateLink: 'UPDATE links SET title = ?, subtitle = ?, url = ?, icon = ?, group_id = ?, subgroup_id = ? WHERE id = ?',
      deleteLink: 'DELETE FROM links WHERE id = ?'
    };
  }
}
