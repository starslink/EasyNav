import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { dbAdapter } from '../db/adapter.js';
import { getQueries } from '../db/queries.js';

const router = express.Router();
const queries = getQueries();

// Get all groups with their subgroups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const groups = await dbAdapter.queryAll(queries.getAllGroups);
    const subgroups = await dbAdapter.queryAll('SELECT * FROM subgroups ORDER BY sort_order ASC, created_at DESC');

    const groupsWithSubgroups = groups.map(group => ({
      ...group,
      subgroups: subgroups.filter(sub => sub.group_id === group.id)
    }));

    res.json(groupsWithSubgroups);
  } catch (error) {
    console.error('获取分组失败:', error);
    res.status(500).json({ error: '获取分组失败' });
  }
});

// Create a new group
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id, name, icon, sort_order } = req.body;

    // Validate sort_order
    if (sort_order < 1 || sort_order > 100) {
      return res.status(400).json({ error: '排序值必须在1-100之间' });
    }

    // Check if sort_order is already used
    const existingSortOrder = await dbAdapter.queryOne(queries.checkSortOrder, [sort_order, id]);
    if (existingSortOrder) {
      return res.status(400).json({ error: '该排序值已被使用' });
    }

    await dbAdapter.execute(queries.createGroup, [id, name, icon, sort_order]);
    const newGroup = await dbAdapter.queryOne(queries.findGroupById, [id]);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('创建分组失败:', error);
    res.status(500).json({ error: '创建分组失败' });
  }
});

// Update a group
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, sort_order } = req.body;

    // Validate sort_order
    if (sort_order < 1 || sort_order > 100) {
      return res.status(400).json({ error: '排序值必须在1-100之间' });
    }

    // Check if sort_order is already used by another group
    const existingSortOrder = await dbAdapter.queryOne(queries.checkSortOrder, [sort_order, id]);
    if (existingSortOrder) {
      return res.status(400).json({ error: '该排序值已被使用' });
    }

    await dbAdapter.execute(queries.updateGroup, [name, icon, sort_order, id]);
    const updatedGroup = await dbAdapter.queryOne(queries.findGroupById, [id]);

    if (!updatedGroup) {
      return res.status(404).json({ error: '分组不存在' });
    }

    res.json(updatedGroup);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: '更新分组失败' });
  }
});

// Delete a group
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const group = await dbAdapter.queryOne(queries.findGroupById, [id]);
    if (!group) {
      return res.status(404).json({ error: '分组不存在' });
    }

    // Check if group has any links
    const links = await dbAdapter.queryAll(queries.getLinksByGroup, [id]);
    if (links && links.length > 0) {
      return res.status(400).json({ error: `无法删除含有链接的分组（当前有 ${links.length} 个链接）` });
    }

    // Delete all subgroups first
    await dbAdapter.execute('DELETE FROM subgroups WHERE group_id = ?', [id]);
    // Delete the group
    await dbAdapter.execute(queries.deleteGroup, [id]);

    res.json({ message: '分组删除成功' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: '删除分组失败' });
  }
});

// Get subgroups for a specific group
router.get('/:groupId/subgroups', authenticateToken, async (req, res) => {
  try {
    const subgroups = await dbAdapter.queryAll(queries.getSubgroupsByGroupId, [req.params.groupId]);
    res.json(subgroups);
  } catch (error) {
    console.error('获取子分组失败:', error);
    res.status(500).json({ error: '获取子分组失败' });
  }
});

// Create a new subgroup
router.post('/:groupId/subgroups', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, sort_order } = req.body;
    const groupId = req.params.groupId;

    // Validate sort_order
    if (sort_order < 1 || sort_order > 100) {
      return res.status(400).json({ error: '排序值必须在1-100之间' });
    }

    const group = await dbAdapter.queryOne(queries.findGroupById, [groupId]);
    if (!group) {
      return res.status(404).json({ error: '分组不存在' });
    }

    // Check if sort_order is already used in this group
    const existingSortOrder = await dbAdapter.queryOne(queries.checkSubgroupSortOrder, [groupId, sort_order, '']);
    if (existingSortOrder) {
      return res.status(400).json({ error: '该排序值在当前分组中已被使用' });
    }

    const id = uuidv4();
    await dbAdapter.execute(queries.createSubgroup, [id, name, groupId, sort_order]);
    const newSubgroup = await dbAdapter.queryOne(queries.findSubgroupById, [id]);
    res.status(201).json(newSubgroup);
  } catch (error) {
    console.error('创建子分组失败:', error);
    res.status(500).json({ error: '创建子分组失败' });
  }
});

// Update a subgroup
router.put('/subgroups/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, sort_order } = req.body;
    const { id } = req.params;

    // Validate sort_order
    if (sort_order < 1 || sort_order > 100) {
      return res.status(400).json({ error: '排序值必须在1-100之间' });
    }

    const subgroup = await dbAdapter.queryOne(queries.findSubgroupById, [id]);
    if (!subgroup) {
      return res.status(404).json({ error: '子分组不存在' });
    }

    // Check if sort_order is already used in this group
    const existingSortOrder = await dbAdapter.queryOne(
        queries.checkSubgroupSortOrder,
        [subgroup.group_id, sort_order, id]
    );
    if (existingSortOrder) {
      return res.status(400).json({ error: '该排序值在当前分组中已被使用' });
    }

    await dbAdapter.execute(queries.updateSubgroup, [name, sort_order, id]);
    const updatedSubgroup = await dbAdapter.queryOne(queries.findSubgroupById, [id]);

    if (!updatedSubgroup) {
      return res.status(404).json({ error: '子分组不存在' });
    }

    res.json(updatedSubgroup);
  } catch (error) {
    console.error('Update subgroup error:', error);
    res.status(500).json({ error: '更新子分组失败' });
  }
});

// Delete a subgroup
router.delete('/subgroups/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbAdapter.execute('UPDATE links SET subgroup_id = NULL WHERE subgroup_id = ?', [id]);
    await dbAdapter.execute(queries.deleteSubgroup, [id]);
    res.json({ message: '子分组删除成功' });
  } catch (error) {
    console.error('Delete subgroup error:', error);
    res.status(500).json({ error: '删除子分组失败' });
  }
});

export const groupsRouter = router;
