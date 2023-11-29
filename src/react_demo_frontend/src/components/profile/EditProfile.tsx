import { FormEvent, useEffect, useState } from "react";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useSession } from "../../ic/useSession";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type EditProfileProps = {
  className?: string;
  allwaysShow?: boolean;
};

export default function EditProfile({
  className,
  allwaysShow,
}: EditProfileProps) {
  const { handleErrors, actor } = useSession();

  // Local state
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [hasProfile, setHasProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!handleErrors || !actor) return;
      const response = await handleErrors(() => actor.get_my_profile());
      if (response && "Ok" in response) {
        setName(response.Ok.name);
        setAvatarUrl(response.Ok.avatar_url);
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    })();
  }, [handleErrors, actor]);

  // Don't render if we already have a profile unless allwaysShow is true
  if (hasProfile && !allwaysShow) return null;

  // Don't render form when loading profile
  if (loading)
    return (
      <div className="flex justify-center w-full">
        <FontAwesomeIcon className="w-4 h-4" icon={faCircleNotch} spin />
      </div>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name || !avatarUrl) return;
    if (!handleErrors || !actor) return;
    setSaving(true);
    const response = await handleErrors(() =>
      actor.save_my_profile({
        name,
        avatar_url: avatarUrl,
      })
    );
    if (response && "Ok" in response) {
      toast.success("Profile saved");
    } else {
      toast.error("Error saving profile");
    }
    setSaving(false);
  }

  const formEmpty = !name && !avatarUrl;

  const submitIcon = saving ? faCircleNotch : undefined;

  const submitText = saving ? "Saving" : "Save";

  const submitDisabled = saving || formEmpty;

  return (
    <div className={className}>
      <div className="flex flex-col items-center w-full gap-5">
        <div className="text-2xl font-bold">User Profile</div>
        <form
          className="flex flex-col items-center w-full gap-5"
          onSubmit={submit}
        >
          <div className="flex flex-col items-center w-full gap-3">
            <label htmlFor="name">What do you want to be called?</label>
            <input
              className="w-full px-3 py-2 leading-tight border rounded appearance-none text-zinc-500 focus:outline-none focus:bg-emerald-200 bg-slate-200"
              name="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              type="text"
              value={name}
            />
          </div>
          <div className="flex flex-col items-center w-full gap-3">
            <label htmlFor="name">Paste a link to your avatar (optional)</label>
            <input
              className="w-full px-3 py-2 leading-tight border rounded appearance-none text-zinc-500 focus:outline-none focus:bg-emerald-200 bg-slate-200"
              name="avatar_url"
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              type="text"
              value={avatarUrl}
            />
          </div>
          <Button
            className="w-full mt-5"
            disabled={submitDisabled}
            icon={submitIcon}
            spin
            type="submit"
            variant="primary"
          >
            {submitText}
          </Button>
        </form>
      </div>
    </div>
  );
}
