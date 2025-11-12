import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Volume2, VolumeX, MapPin, Clock, User as UserIcon, Heart, Share2, Brain, TrendingUp, Mail, Pencil, X, Check } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageContext";

export default function Feed() {
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [editingObservation, setEditingObservation] = useState(null);
  const [editForm, setEditForm] = useState({});
  const videoRefs = useRef({});
  const queryClient = useQueryClient();

  const { data: observations = [], isLoading } = useQuery({
    queryKey: ['fieldnotes'],
    queryFn: () => base44.entities.FieldNote.list("-created_date"),
    initialData: []
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (observations.length > 0) {
      const categoryCounts = observations.reduce((acc, obs) => {
        let processedCategory = obs.impact_category;
        // Combine conservation and restoration into a single category for analysis
        if (processedCategory === 'conservation' || processedCategory === 'restoration') {
          processedCategory = 'conservation_restoration';
        } else if (processedCategory === 'wildlife' || processedCategory === 'habitat_loss') {
          processedCategory = 'biodiversity_impacts'; // Combine wildlife and habitat loss
        }
        if (processedCategory) {
          acc[processedCategory] = (acc[processedCategory] || 0) + 1;
        }
        return acc;
      }, {});

      let mostCommonCategory = null;
      let maxCount = 0;
      for (const category in categoryCounts) {
        if (categoryCounts[category] > maxCount) {
          maxCount = categoryCounts[category];
          mostCommonCategory = category;
        }
      }

      setAnalysis({
        totalObservations: observations.length,
        mostCommonCategory: mostCommonCategory,
        mostCommonCategoryCount: maxCount,
        categoryCounts: categoryCounts
      });
    } else {
      setAnalysis(null);
    }
  }, [observations]);

  const updateObservationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FieldNote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fieldnotes'] });
      setEditingObservation(null);
      setEditForm({});
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ id, currentLikes }) =>
      base44.entities.FieldNote.update(id, { likes: currentLikes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fieldnotes'] });
    },
  });

  const startEdit = (obs) => {
    setEditingObservation(obs.id);
    setEditForm({
      title: obs.title,
      description: obs.description || '',
      location_name: obs.location_name || '',
      tags: obs.tags ? obs.tags.join(', ') : ''
    });
  };

  const cancelEdit = () => {
    setEditingObservation(null);
    setEditForm({});
  };

  const saveEdit = (obsId) => {
    const tags = editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    updateObservationMutation.mutate({
      id: obsId,
      data: {
        title: editForm.title,
        description: editForm.description,
        location_name: editForm.location_name,
        tags: tags
      }
    });
  };

  const togglePlay = (obsId) => {
    const video = videoRefs.current[obsId];
    if (video) {
      if (video.paused) {
        video.play();
        setActiveVideo(obsId);
      } else {
        video.pause();
        setActiveVideo(null);
      }
    }
  };

  const handleLike = (obs) => {
    likeMutation.mutate({
      id: obs.id,
      currentLikes: obs.likes || 0
    });
  };

  const handleShare = (obs, platform) => {
    const shareUrl = encodeURIComponent(window.location.origin);
    const shareText = encodeURIComponent(`Check out this environmental observation: ${obs.title}`);
    const shareBody = encodeURIComponent(`Check out this environmental observation:\n\nTitle: ${obs.title}\nDescription: ${obs.description || 'No description provided.'}\n\nView more: ${window.location.origin}`);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
      twitter: `https://www.twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&su=${shareText}&body=${shareBody}`,
      email: `mailto:?subject=${shareText}&body=${shareBody}`
    };

    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: obs.title,
        text: obs.description || 'Environmental observation from EcoImpact',
        url: window.location.href
      }).catch((error) => console.log('Error sharing:', error));
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  const categoryColors = {
    pollutants_and_waste: "bg-red-900 text-red-300",
    air_quality: "bg-sky-900 text-sky-300",
    deforestation: "bg-orange-900 text-orange-300",
    biodiversity_impacts: "bg-green-900 text-green-300",
    water_quality: "bg-blue-900 text-blue-300",
    extreme_heat_and_drought_impacts: "bg-rose-900 text-rose-300",
    fires_natural_or_human_caused: "bg-orange-800 text-orange-200",
    conservation_restoration: "bg-teal-900 text-teal-300",
    human_disparities_and_inequity: "bg-violet-900 text-violet-300",
    soundscape: "bg-indigo-900 text-indigo-300",
    other: "bg-gray-900 text-gray-300"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1b263b]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1b263b] to-[#0d1b2a]">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-neutral-50 mb-2 text-xl font-bold drop-shadow-lg">{t("measuringImpact")}</h1>
          <p className="text-lg text-cyan-300">{t("earthReporters")}</p>
        </div>

        {analysis && analysis.totalObservations > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="p-6 border-2 border-cyan-900/50 bg-gradient-to-br from-[#1b263b] to-[#0d1b2a] shadow-xl shadow-cyan-500/20">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68ea68d0d5ddf7783ea8c465/b9c21dbeb_Untitleddesign37.png"
                  alt="Impact Dashboard"
                  className="w-8 h-8"
                  style={{ filter: 'invert(70%) sepia(50%) saturate(500%) hue-rotate(160deg) brightness(1.2)' }}
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{t("impactDashboard")}</h3>
                  <p className="text-cyan-300 text-sm">{t("breakdown")}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-white">
                <div>
                  <p className="font-semibold text-cyan-200">{t("totalObservations")}:</p>
                  <p className="text-xl font-bold text-cyan-400">{analysis.totalObservations}</p>
                </div>
                {analysis.mostCommonCategory && (
                  <div>
                    <p className="font-semibold text-cyan-200">{t("mostReported")}:</p>
                    <Badge className={`${categoryColors[analysis.mostCommonCategory]} border-0 font-semibold text-lg py-1 px-3`}>
                      {t(analysis.mostCommonCategory.replace(/_/g, ''))}
                    </Badge>
                    <span className="ml-2 text-cyan-300 text-sm">({analysis.mostCommonCategoryCount} {t("observations").toLowerCase()})</span>
                  </div>
                )}
              </div>
              {Object.keys(analysis.categoryCounts).length > 1 && (
                <div className="mt-4 pt-4 border-t border-cyan-900/50">
                  <p className="font-semibold mb-2 text-cyan-200">Breakdown by Category:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analysis.categoryCounts).map(([cat, count]) => (
                      <Badge key={cat} className={`${categoryColors[cat]} border-0 text-sm`}>
                        {t(cat.replace(/_/g, ''))} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {observations.map((obs) => {
              let currentCategoryKey = obs.impact_category;
              let displayBadgeText = obs.impact_category ? obs.impact_category.replace(/_/g, ' ') : '';
              let resolvedColorClass = categoryColors.other;

              if (currentCategoryKey) {
                if (currentCategoryKey === 'conservation' || currentCategoryKey === 'restoration') {
                  currentCategoryKey = 'conservation_restoration';
                  displayBadgeText = t('conservationrestoration') || 'Conservation Restoration';
                } else if (currentCategoryKey === 'wildlife' || currentCategoryKey === 'habitat_loss') {
                  currentCategoryKey = 'biodiversity_impacts';
                  displayBadgeText = t('biodiversityimpacts') || 'Biodiversity Impacts';
                }
                resolvedColorClass = categoryColors[currentCategoryKey] || categoryColors.other;
              }

              const isEditing = editingObservation === obs.id;
              const canEdit = currentUser && obs.created_by === currentUser.email;

              return (
                <motion.div
                  key={obs.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="overflow-hidden border-2 border-cyan-900/50 bg-[#152033] shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      {obs.media_type === "video" && (
                        <div className="relative aspect-video bg-black">
                          <video
                            ref={(el) => videoRefs.current[obs.id] = el}
                            src={obs.media_url}
                            className="w-full h-full object-cover"
                            loop
                            muted={isMuted}
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                              size="lg"
                              className="w-16 h-16 rounded-full bg-cyan-400/90 hover:bg-cyan-400 text-[#0a1628] shadow-2xl"
                              onClick={() => togglePlay(obs.id)}
                            >
                              {activeVideo === obs.id ? (
                                <Pause className="w-8 h-8" />
                              ) : (
                                <Play className="w-8 h-8 ml-1" />
                              )}
                            </Button>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </Button>
                        </div>
                      )}

                      {obs.media_type === "image" && (
                        <img
                          src={obs.media_url}
                          alt={obs.title}
                          className="w-full aspect-video object-cover"
                        />
                      )}

                      {obs.media_type === "audio" && (
                        <div className="aspect-video bg-gradient-to-br from-[#1b263b] to-[#0d1b2a] flex items-center justify-center">
                          <div className="text-center text-white">
                            <Volume2 className="w-20 h-20 mx-auto mb-4 text-cyan-400" />
                            <p className="text-xl font-semibold">Soundscape Recording</p>
                          </div>
                          <audio
                            controls
                            src={obs.media_url}
                            className="absolute bottom-4 left-4 right-4"
                          />
                        </div>
                      )}

                      {/* Additional Images Gallery */}
                      {obs.images && obs.images.length > 0 && (
                        <div className={`${obs.media_url ? 'mt-2' : ''} grid gap-2 ${obs.images.length === 1 ? 'grid-cols-1' : obs.images.length === 2 ? 'grid-cols-2' : obs.images.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} p-2 bg-black/20`}>
                          {obs.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${obs.title} - Image ${idx + 1}`}
                              className={`w-full object-cover rounded-lg ${obs.images.length <= 2 ? 'h-64' : 'h-40'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {isEditing ? (
                        <div className="space-y-4 mb-4">
                          <div>
                            <Input
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="text-xl font-bold bg-cyan-900/20 text-white border-cyan-700"
                              placeholder={t("title")}
                            />
                          </div>
                          <div>
                            <Textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="bg-cyan-900/20 text-cyan-200 border-cyan-700"
                              placeholder={t("description")}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Input
                              value={editForm.location_name}
                              onChange={(e) => setEditForm({ ...editForm, location_name: e.target.value })}
                              className="bg-cyan-900/20 text-white border-cyan-700"
                              placeholder={t("location")}
                            />
                          </div>
                          <div>
                            <Input
                              value={editForm.tags}
                              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                              className="bg-cyan-900/20 text-white border-cyan-700"
                              placeholder={t("tagsCommaSeparated")}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => saveEdit(obs.id)}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              disabled={updateObservationMutation.isLoading}
                            >
                              {updateObservationMutation.isLoading ? t("saving") + "..." : (<><Check className="w-4 h-4 mr-2" />{t("save")}</>)}
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              variant="outline"
                              className="border-cyan-700 text-cyan-300 hover:bg-cyan-900/30 flex-1"
                              disabled={updateObservationMutation.isLoading}
                            >
                              <X className="w-4 h-4 mr-2" />
                              {t("cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={createPageUrl("Profile", obs.created_by)}
                                  className="hover:text-cyan-400 transition-colors"
                                >
                                  <h3 className="text-2xl font-bold text-white mb-2 break-words">{obs.title}</h3>
                                </Link>
                                {obs.description && <p className="text-cyan-200 break-words">{obs.description}</p>}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 self-start">
                                {obs.impact_category && (
                                  <Badge className={`${resolvedColorClass} border-0 font-semibold text-xs sm:text-sm`}>
                                    {displayBadgeText}
                                  </Badge>
                                )}
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEdit(obs)}
                                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30 h-8 w-8"
                                    aria-label={t("editObservation")}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-cyan-300 mb-4">
                            <Link
                              to={createPageUrl("Profile", obs.created_by)}
                              className="flex items-center gap-2 hover:text-cyan-100 transition-colors"
                            >
                              <UserIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="break-all">{obs.created_by}</span>
                            </Link>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>{format(new Date(obs.created_date), "MMM d, yyyy")}</span>
                            </div>
                            {obs.location_name && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="break-words">{obs.location_name}</span>
                              </div>
                            )}
                          </div>

                          {obs.tags && obs.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {obs.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="bg-cyan-900/50 text-cyan-300 border-cyan-800">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-cyan-900/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(obs)}
                          className="flex-1 text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100"
                          disabled={isEditing}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${obs.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                          Like ({obs.likes || 0})
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100"
                              disabled={isEditing}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1b263b] border-cyan-900/50">
                            <DropdownMenuItem
                              onClick={() => handleShare(obs, 'facebook')}
                              className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Facebook
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShare(obs, 'twitter')}
                              className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Twitter
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShare(obs, 'linkedin')}
                              className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              LinkedIn
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShare(obs, 'gmail')}
                              className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Gmail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShare(obs, 'email')}
                              className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </DropdownMenuItem>
                            {navigator.share && (
                              <DropdownMenuItem
                                onClick={() => handleShare(obs, 'native')}
                                className="text-cyan-200 hover:bg-cyan-900/30 hover:text-cyan-100 cursor-pointer"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                More Options
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {observations.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-cyan-900/50 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-cyan-400" />
              </div>
              <h3 className="2xl font-semibold text-white mb-2">{t("noReportsYet")}</h3>
              <p className="text-cyan-300 mb-6">{t("beFirst")}</p>
              <Link to={createPageUrl("FieldNotebook")}>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  {t("uploadFirstReport")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}