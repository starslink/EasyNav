import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { dbAdapter } from '../db/adapter.js';
import { getQueries } from '../db/queries.js';

const router = express.Router();
const queries = getQueries();

// Get all links
router.get('/', authenticateToken, async (req, res) => {
  try {
    const links = await dbAdapter.queryAll('SELECT l.*, g.name as group_name, sg.name as subgroup_name\n' +
        '      FROM links l\n' +
        '      LEFT JOIN `groups` g ON l.group_id = g.id\n' +
        '      LEFT JOIN subgroups sg ON l.subgroup_id = sg.id\n' +
        '      ORDER BY l.created_at DESC');
    res.json(links);
  } catch (error) {
    console.error('获取链接失败:', error);
    res.status(500).json({ error: '获取链接失败' });
  }
});

// Get links by group and optional subgroup
router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { subgroupId } = req.query;

    let links;
    if (subgroupId) {
      links = await dbAdapter.queryAll(queries.getLinksByGroupAndSubgroup, [groupId, subgroupId]);
    } else {
      links = await dbAdapter.queryAll(queries.getLinksByGroup, [groupId]);
    }

    res.json(links);
  } catch (error) {
    console .error('获取链接失败:', error);
    res.status(500).json({ error: '获取链接失败' });
  }
});

// Create a new link
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id, title, subtitle, url, icon, group_id, subgroup_id } = req.body;

    // Validate group exists
    const group = await dbAdapter.queryOne(queries.findGroupById, [group_id]);
    if (!group) {
      return res.status(404).json({ error: '分组不存在' });
    }

    // Validate subgroup if provided
    if (subgroup_id) {
      const subgroup = await dbAdapter.queryOne(
        'SELECT id FROM subgroups WHERE id = ? AND group_id = ?',
        [subgroup_id, group_id]
      );
      if (!subgroup) {
        return res.status(404).json({ error: '二级分类不存在或不属于该分组' });
      }
    }

    await dbAdapter.execute(queries.createLink, [id, title, subtitle, url, icon, group_id, subgroup_id]);
    const newLink = await dbAdapter.queryOne('SELECT * FROM links WHERE id = ?', [id]);
    res.status(201).json(newLink);
  } catch (error) {
    console.error('创建链接失败:', error);
    res.status(500).json({ error: '创建链接失败' });
  }
});

// Update a link
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, url, icon, group_id, subgroup_id } = req.body;

    // Check if link exists
    const existingLink = await dbAdapter.queryOne('SELECT id FROM links WHERE id = ?', [id]);
    if (!existingLink) {
      return res.status(404).json({ error: '链接不存在' });
    }

    // Validate group exists
    const group = await dbAdapter.queryOne(queries.findGroupById, [group_id]);
    if (!group) {
      return res.status(404).json({ error: '分组不存在' });
    }

    // Validate subgroup if provided
    if (subgroup_id) {
      const subgroup = await dbAdapter.queryOne(
        'SELECT id FROM subgroups WHERE id = ? AND group_id = ?',
        [subgroup_id, group_id]
      );
      if (!subgroup) {
        return res.status(404).json({ error: '二级分类不存在或不属于该分组' });
      }
    }

    await dbAdapter.execute(queries.updateLink, [title, subtitle, url, icon, group_id, subgroup_id, id]);
    const updatedLink = await dbAdapter.queryOne('SELECT * FROM links WHERE id = ?', [id]);
    res.json(updatedLink);
  } catch (error) {
    console.error('更新链接失败:', error);
    res.status(500).json({ error: '更新链接失败' });
  }
});

// Delete a link
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if link exists
    const link = await dbAdapter.queryOne('SELECT id FROM links WHERE id = ?', [id]);
    if (!link) {
      return res.status(404).json({ error: '链接不存在' });
    }

    await dbAdapter.execute(queries.deleteLink, [id]);
    res.json({ message: '链接删除成功' });
  } catch (error) {
    console.error('删除链接失败:', error);
    res.status(500).json({ error: '删除链接失败' });
  }
});

export const linksRouter = router;
