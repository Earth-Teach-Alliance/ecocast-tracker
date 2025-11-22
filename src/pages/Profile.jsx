import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, FileText, Camera, Award, TrendingUp, LogOut, Pencil, Check, X, Trash2, Share2, Image, UserPlus, UserMinus, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    observations: 0,
    fieldNotes: 0,
    locations: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const fileInputRef = useRef(null);
  const headerInputRef = useRef(null);

  // Get user email from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const profileEmail = urlParams.get('email');

  useEffect(() => {
    loadProfile();
  }, [profileEmail]);

  useEffect(() => {
    if (user && currentUser) {
      checkFollowStatus();
      loadFollowCounts();
    }
  }, [user, currentUser]);

  const loadProfile = async () => {
    try {
      const loggedInUser = await base44.auth.me();
      setCurrentUser(loggedInUser);
      
      // If email param provided, load that user's data; otherwise load current user
      const targetEmail = profileEmail || loggedInUser.email;
      
      // Load user info - for now we'll use the email as identifier
      // You can fetch from User entity if needed, but for field notes we just need email
      let targetUser;
      if (profileEmail && profileEmail !== loggedInUser.email) {
        // Viewing another user's profile - try to get their info
        const users = await base44.entities.User.filter({ email: profileEmail });
        targetUser = users.length > 0 ? users[0] : { email: profileEmail, full_name: profileEmail };
      } else {
        targetUser = loggedInUser;
      }
      
      setUser(targetUser);
      setEditName(targetUser.full_name || "");

      const fieldNotes = await base44.entities.FieldNote.filter({ created_by: targetEmail });

      const uniqueLocations = new Set(
        fieldNotes
          .filter((note) => note.latitude && note.longitude)
          .map((note) => `${note.latitude},${note.longitude}`)
      );

      setStats({
        observations: fieldNotes.length, // Renamed 'observations' to 'fieldNotes' count
        fieldNotes: fieldNotes.length,
        locations: uniqueLocations.size
      });

      const combined = [
        ...fieldNotes.map((n) => ({ ...n, type: 'note', title: n.title || `Field Note ${n.id}` }))
      ]
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5);

      setRecentActivity(combined);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setIsLoading(false);
  };

  // Removed deleteObservationMutation as per outline
  const deleteFieldNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.FieldNote.delete(id),
    onSuccess: () => {
      loadProfile();
      setDeleteItem(null);
    },
  });

  const handleDelete = (item) => {
    // Simplified to only handle field note deletion
    deleteFieldNoteMutation.mutate(item.id);
  };

  const handleEdit = (item) => {
    // Simplified to only navigate to FieldNotebook
    navigate(createPageUrl("FieldNotebook"), { state: { editFieldNoteId: item.id } });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_picture_url: file_url });
      await loadProfile(); // Refresh profile data
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setIsUploadingImage(false);
  };

  const handleHeaderUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingHeader(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_header_image: file_url });
      await loadProfile();
    } catch (error) {
      console.error("Error uploading header image:", error);
    }
    setIsUploadingHeader(false);
  };

  const handleSaveName = async () => {
    try {
      await base44.auth.updateMe({ full_name: editName });
      await loadProfile(); // Refresh profile data
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handleShareProfile = (platform) => {
    const profileUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(`Check out ${user?.full_name || user?.email}'s environmental impact profile on EcoCast Tracker!`);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${profileUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${profileUrl}&text=${shareText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${profileUrl}`,
      email: `mailto:?subject=EcoCast Tracker Profile&body=${shareText}%0A%0A${decodeURIComponent(profileUrl)}`
    };

    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: `${user?.full_name || user?.email}'s Profile`,
        text: `Check out my environmental impact profile on EcoCast Tracker!`,
        url: window.location.href
      }).catch((error) => console.log('Error sharing:', error));
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate("/");
  };

  const isOwnProfile = currentUser && user && currentUser.email === user.email;

  const checkFollowStatus = async () => {
    if (!isOwnProfile && currentUser && user) {
      const follows = await base44.entities.Follow.filter({
        follower_email: currentUser.email,
        following_email: user.email
      });
      setIsFollowing(follows.length > 0);
    }
  };

  const loadFollowCounts = async () => {
    if (user) {
      const followers = await base44.entities.Follow.filter({ following_email: user.email });
      const following = await base44.entities.Follow.filter({ follower_email: user.email });
      setFollowerCount(followers.length);
      setFollowingCount(following.length);
    }
  };

  const handleFollow = async () => {
    if (isFollowing) {
      const follows = await base44.entities.Follow.filter({
        follower_email: currentUser.email,
        following_email: user.email
      });
      if (follows.length > 0) {
        await base44.entities.Follow.delete(follows[0].id);
      }
    } else {
      await base44.entities.Follow.create({
        follower_email: currentUser.email,
        following_email: user.email
      });
      
      // Create notification
      await base44.entities.Notification.create({
        user_email: user.email,
        type: "follow",
        content: `${currentUser.full_name || currentUser.email} started following you`,
        from_user: currentUser.email
      });
    }
    setIsFollowing(!isFollowing);
    await loadFollowCounts();
  };

  const handleSendMessage = () => {
    navigate(createPageUrl("Messages"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1b263b]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1b263b] to-[#0d1b2a] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="border-2 border-cyan-900/50 shadow-xl shadow-cyan-500/20 mb-8 overflow-hidden bg-gradient-to-br from-[#1b263b] to-[#0d1b2a]">
          <div className="relative h-32 bg-gradient-to-r from-green-800 to-cyan-900 group">
            {user?.profile_header_image && (
              <img
                src={user.profile_header_image}
                alt="Profile header"
                className="w-full h-full object-cover"
              />
            )}
            {isOwnProfile && (
              <>
                <input
                  ref={headerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderUpload}
                  className="hidden"
                />
                <button
                  onClick={() => headerInputRef.current?.click()}
                  disabled={isUploadingHeader}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
              {isUploadingHeader ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Image className="w-4 h-4" />
                  Change Header
                </>
              )}
              </button>
              </>
              )}
          </div>
          <CardContent className="p-8 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
              <div className="relative group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {user?.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-emerald-600 border-4 border-white shadow-xl">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  )}
                  {isOwnProfile && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-0 right-0 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                  {isUploadingImage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  </button>
                  )}
              </div>
              <div className="flex-1">
                {isOwnProfile && isEditing ? (
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xl font-bold bg-white/10 text-white border-cyan-500"
                    />
                    <Button
                      size="icon"
                      onClick={handleSaveName}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(user?.full_name || "");
                      }}
                      className="border-cyan-500 text-cyan-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {user?.full_name || user?.email}
                    </h1>
                    {isOwnProfile && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/30"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
                <p className="text-neutral-50 mb-2 font-bold">Earth Reporter</p>
                <div className="flex gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-white font-semibold">{followerCount}</span>
                    <span className="text-cyan-300 ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="text-white font-semibold">{followingCount}</span>
                    <span className="text-cyan-300 ml-1">Following</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <Award className="w-4 h-4 mr-1" />
                    Active Contributor
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {!isOwnProfile && (
                  <>
                    <Button
                      onClick={handleFollow}
                      className={isFollowing ? "bg-cyan-800 hover:bg-cyan-900" : "bg-cyan-600 hover:bg-cyan-700"}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      variant="outline"
                      className="border-cyan-500 text-cyan-300 hover:bg-cyan-900/30"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-cyan-500 text-cyan-300 hover:bg-cyan-900/30">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1b263b] border-cyan-900/50">
                    <DropdownMenuItem
                      onClick={() => handleShareProfile('facebook')}
                      className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                    >
                      Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleShareProfile('twitter')}
                      className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                    >
                      Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleShareProfile('linkedin')}
                      className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                    >
                      LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleShareProfile('email')}
                      className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                    >
                      Email
                    </DropdownMenuItem>
                    {navigator.share && (
                      <DropdownMenuItem
                        onClick={() => handleShareProfile('native')}
                        className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                      >
                        More Options
                        </DropdownMenuItem>
                        )}
                        </DropdownMenuContent>
                        </DropdownMenu>
                        {isOwnProfile && (
                        <Button variant="outline" onClick={handleLogout} className="border-cyan-500 text-cyan-300 hover:bg-cyan-900/30">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                        </Button>
                        )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changed grid layout to 2 columns and updated the first card to reflect Field Notes instead of Observations */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link to={createPageUrl("FieldNotebook")} className="block">
            <Card className="border-2 border-amber-500/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-amber-900 to-orange-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-100">
                  <FileText className="w-5 h-5" />
                  Field Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-amber-300">{stats.fieldNotes}</p>
                <p className="text-sm text-amber-200 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Detailed entries
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Map")} className="block">
            <Card className="border-2 border-emerald-500/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-emerald-900 to-green-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-emerald-100">
                  <MapPin className="w-5 h-5" />
                  Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-emerald-300">{stats.locations}</p>
                <p className="text-sm text-emerald-200 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Areas documented
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="border-2 border-cyan-900/50 shadow-lg bg-gradient-to-br from-[#1b263b] to-[#0d1b2a]">
          <CardHeader className="border-b border-cyan-900/50">
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-cyan-900/20 transition-colors">
                  {/* Simplified icon and background as only Field Notes are displayed */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-900">
                    <FileText className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-cyan-300 mt-1">
                      {new Date(item.created_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Simplified badge text and color */}
                    <Badge variant="outline" className="text-xs border-amber-700 text-amber-300">
                      Field Note
                    </Badge>
                    {isOwnProfile && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteItem(item)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <p className="text-center text-cyan-400 py-8">No activity yet. Start documenting!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent className="bg-[#1b263b] border-cyan-900/50">
          <AlertDialogHeader>
            {/* Updated AlertDialogTitle to refer only to Field Note */}
            <AlertDialogTitle className="text-white">Delete Field Note?</AlertDialogTitle>
            <AlertDialogDescription className="text-cyan-300">
              Are you sure you want to delete this Field Note "{deleteItem?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-cyan-900/30 text-cyan-100 border-cyan-700 hover:bg-cyan-900/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteItem)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}