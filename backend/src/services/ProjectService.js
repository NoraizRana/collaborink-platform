import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

export class ProjectService {
  static async createProject(projectData, userId) {
    const project = new Project({
      ...projectData,
      owner: userId,
      members: [{ user: userId, role: 'owner' }],
    });

    await project.save();

    // Log activity
    await Activity.create({
      workspace: projectData.workspace,
      user: userId,
      type: 'project_created',
      action: `Created project "${project.name}"`,
      resource: 'project',
      resourceId: project._id,
    });

    return project.populate('owner members.user');
  }

  static async getProject(projectId) {
    return await Project.findById(projectId)
      .populate('owner')
      .populate('members.user')
      .populate('team');
  }

  static async getProjectTasks(projectId, filters = {}) {
    const query = { project: projectId };

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignee) query.assignee = filters.assignee;

    return await Task.find(query)
      .populate('assignee')
      .populate('creator')
      .sort({ priority: -1, dueDate: 1 });
  }

  static async updateProject(projectId, updateData, userId) {
    const project = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true }
    ).populate('owner members.user');

    // Log activity
    await Activity.create({
      workspace: project.workspace,
      user: userId,
      type: 'project_updated',
      action: 'Updated project',
      resource: 'project',
      resourceId: projectId,
    });

    return project;
  }

  static async addMember(projectId, userId, role = 'member', addedBy) {
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $push: {
          members: { user: userId, role },
        },
      },
      { new: true }
    ).populate('members.user');

    // Log activity
    await Activity.create({
      workspace: project.workspace,
      user: addedBy,
      type: 'member_joined',
      action: `Added member to project`,
      resource: 'project',
      resourceId: projectId,
      relatedUser: userId,
    });

    return project;
  }

  static async removeMember(projectId, userId, removedBy) {
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          members: { user: userId },
        },
      },
      { new: true }
    );

    // Log activity
    await Activity.create({
      workspace: project.workspace,
      user: removedBy,
      type: 'member_joined', // Could be 'member_removed' if you add it
      action: `Removed member from project`,
      resource: 'project',
      resourceId: projectId,
      relatedUser: userId,
    });

    return project;
  }

  static async deleteProject(projectId, userId) {
    // Delete all tasks in project
    await Task.deleteMany({ project: projectId });

    // Delete project
    const project = await Project.findByIdAndDelete(projectId);

    // Log activity
    await Activity.create({
      workspace: project.workspace,
      user: userId,
      type: 'project_created', // Could be 'project_deleted'
      action: `Deleted project`,
      resource: 'project',
      resourceId: projectId,
    });

    return project;
  }

  static async getProjectStats(projectId) {
    const tasks = await Task.find({ project: projectId });

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
      highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      overdue: tasks.filter(t => t.dueDate < new Date() && t.status !== 'done').length,
    };

    return stats;
  }
}