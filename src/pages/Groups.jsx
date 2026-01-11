import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, LogIn, Trash2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Groups() {
  const [myGroups, setMyGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);

    const memberships = await base44.entities.GroupMember.filter({ user_email: user.email });
    const groupIds = memberships.map(m => m.group_id);
    
    if (groupIds.length > 0) {
      const groups = await Promise.all(
        groupIds.map(id => base44.entities.Group.filter({ id }))
      );
      const flatGroups = groups.flat();
      
      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        flatGroups.map(async (group) => {
          const members = await base44.entities.GroupMember.filter({ group_id: group.id });
          const entries = await base44.entities.FieldNote.filter({ group_id: group.id });
          return {
            ...group,
            memberCount: members.length,
            entryCount: entries.length,
            isTeacher: group.teacher_email === user.email
          };
        })
      );
      
      setMyGroups(groupsWithCounts);
    }
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const code = generateCode();
    
    const group = await base44.entities.Group.create({
      name: formData.name,
      description: formData.description,
      code: code,
      teacher_email: currentUser.email
    });

    await base44.entities.GroupMember.create({
      group_id: group.id,
      user_email: currentUser.email,
      role: "teacher"
    });

    setShowCreateForm(false);
    setFormData({ name: "", description: "" });
    loadData();
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    
    const groups = await base44.entities.Group.filter({ code: joinCode.toUpperCase() });
    if (groups.length === 0) {
      alert("Invalid group code");
      return;
    }

    const group = groups[0];
    const existing = await base44.entities.GroupMember.filter({
      group_id: group.id,
      user_email: currentUser.email
    });

    if (existing.length > 0) {
      alert("You're already a member of this group");
      return;
    }

    await base44.entities.GroupMember.create({
      group_id: group.id,
      user_email: currentUser.email,
      role: "student"
    });

    setShowJoinForm(false);
    setJoinCode("");
    loadData();
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("Are you sure you want to delete this group? All members will be removed.")) {
      return;
    }

    const members = await base44.entities.GroupMember.filter({ group_id: groupId });
    await Promise.all(members.map(m => base44.entities.GroupMember.delete(m.id)));
    await base44.entities.Group.delete(groupId);
    
    loadData();
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm("Are you sure you want to leave this group?")) {
      return;
    }

    const membership = await base44.entities.GroupMember.filter({
      group_id: groupId,
      user_email: currentUser.email
    });

    if (membership.length > 0) {
      await base44.entities.GroupMember.delete(membership[0].id);
      loadData();
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1b263b] to-[#0d1b2a] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">My Groups</h1>
            <p className="text-lg text-cyan-300">Collaborate with your class or project team</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </Button>
            <Button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Join Group
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="border-2 border-green-900/50 bg-[#152033]">
                <CardHeader>
                  <CardTitle className="text-white">Create New Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Group Name (e.g., Biology 101, Fall 2024)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-cyan-900/20 text-white border-cyan-700"
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Description (optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-cyan-900/20 text-white border-cyan-700"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1">
                        Create Group
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        className="border-cyan-700 text-cyan-300 flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {showJoinForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="border-2 border-cyan-900/50 bg-[#152033]">
                <CardHeader>
                  <CardTitle className="text-white">Join a Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoinGroup} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Enter Group Code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        required
                        className="bg-cyan-900/20 text-white border-cyan-700 uppercase"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 flex-1">
                        Join Group
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowJoinForm(false)}
                        className="border-cyan-700 text-cyan-300 flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6">
          {myGroups.map((group) => (
            <Card key={group.id} className="border-2 border-cyan-900/50 bg-[#152033] shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white mb-2">{group.name}</CardTitle>
                    {group.description && (
                      <p className="text-cyan-300 text-sm">{group.description}</p>
                    )}
                  </div>
                  {group.isTeacher && (
                    <Badge className="bg-green-600 text-white">Teacher</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-cyan-900/20 rounded-lg">
                    <span className="text-cyan-300 text-sm">Group Code:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono font-bold">{group.code}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyCode(group.code)}
                        className="h-8 w-8 text-cyan-300 hover:text-cyan-100"
                      >
                        {copiedCode === group.code ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-cyan-900/20 rounded-lg">
                      <Users className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                      <p className="text-white font-semibold">{group.memberCount}</p>
                      <p className="text-cyan-300">Members</p>
                    </div>
                    <div className="text-center p-3 bg-cyan-900/20 rounded-lg">
                      <Users className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                      <p className="text-white font-semibold">{group.entryCount}</p>
                      <p className="text-cyan-300">Entries</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {group.isTeacher ? (
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="flex-1 border-red-700 text-red-300 hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Group
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleLeaveGroup(group.id)}
                        className="flex-1 border-cyan-700 text-cyan-300 hover:bg-cyan-900/30"
                      >
                        Leave Group
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {myGroups.length === 0 && !showCreateForm && !showJoinForm && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-cyan-900/20 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Groups Yet</h3>
            <p className="text-cyan-300 mb-6">Create a group or join an existing one to collaborate</p>
          </div>
        )}
      </div>
    </div>
  );
}