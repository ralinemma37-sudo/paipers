"use client";

/**
 * Informations — réf. paipers-mobile/app/(tabs)/profil/informations.tsx
 * Personnel : upsert profiles. Pro : hub Mon entreprise (sans stockage inventé).
 */

import { useEffect, useState, type CSSProperties } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import ProCompanyHub from "@/components/profil/ProCompanyHub";
import { useNavSpace } from "@/components/NavSpaceProvider";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function InformationsPage() {
  const { showProTabs, loaded: spaceLoaded } = useNavSpace();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [birthdateSupported, setBirthdateSupported] = useState(true);

  useEffect(() => {
    if (showProTabs) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      setMessage("");
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setLoading(false);
        setMessage("Connecte-toi pour modifier ton profil.");
        return;
      }

      setEmail(user.email || "");

      const withBirth = await supabase
        .from("profiles")
        .select(
          "full_name,first_name,last_name,phone,birthdate,address_line1,address_line2,postal_code,city,country",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (withBirth.error) {
        setBirthdateSupported(false);
        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "full_name,first_name,last_name,phone,address_line1,address_line2,postal_code,city,country",
          )
          .eq("id", user.id)
          .maybeSingle();
        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setPhone(profile.phone || "");
          setAddress1(profile.address_line1 || "");
          setAddress2(profile.address_line2 || "");
          setPostalCode(profile.postal_code || "");
          setCity(profile.city || "");
          setCountry(profile.country || "");
        }
      } else if (withBirth.data) {
        const p = withBirth.data;
        setFirstName(p.first_name || "");
        setLastName(p.last_name || "");
        setPhone(p.phone || "");
        setBirthdate((p as { birthdate?: string | null }).birthdate || "");
        setAddress1(p.address_line1 || "");
        setAddress2(p.address_line2 || "");
        setPostalCode(p.postal_code || "");
        setCity(p.city || "");
        setCountry(p.country || "");
      }

      setLoading(false);
    };

    void loadProfile();
  }, [showProTabs]);

  async function handleSave() {
    setMessage("");
    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setSaving(false);
      setMessage("Connecte-toi pour modifier ton profil.");
      return;
    }

    const computedFullName = `${firstName} ${lastName}`.trim();
    const payload: Record<string, unknown> = {
      id: user.id,
      full_name: computedFullName || null,
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
      address_line1: address1 || null,
      address_line2: address2 || null,
      postal_code: postalCode || null,
      city: city || null,
      country: country || null,
    };
    if (birthdateSupported) {
      payload.birthdate = birthdate || null;
    }

    const { error } = await supabase.from("profiles").upsert(payload);
    if (error) {
      setMessage(`Erreur : ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Informations enregistrées");
    setSaving(false);
  }

  const fieldStyle: CSSProperties = {
    width: "100%",
    borderRadius: 14,
    border: `1px solid ${PAIPERS_COLORS.border}`,
    background: "#fff",
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: PAIPERS_COLORS.textPrimary,
  };

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 960 }}
        >
          {!spaceLoaded ? (
            <p className="paipers-text-muted">Chargement…</p>
          ) : showProTabs ? (
            <ProCompanyHub />
          ) : (
            <>
              <ProfilSubpageHeader
                title="Informations"
                subtitle="Tes infos personnelles et préférences."
              />

              {loading ? (
                <p className="paipers-text-muted">Chargement…</p>
              ) : (
                <div
                  className="paipers-elevated-card"
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <section>
                    <p style={{ fontWeight: 800, margin: "0 0 10px", fontSize: 15 }}>Compte</p>
                    <label
                      style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}
                    >
                      Email
                    </label>
                    <input
                      value={email}
                      disabled
                      style={{ ...fieldStyle, background: "#F5F5F5" }}
                    />
                  </section>

                  <section>
                    <p style={{ fontWeight: 800, margin: "0 0 10px", fontSize: 15 }}>Identité</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Prénom
                        </label>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Nom
                        </label>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                    </div>
                    {birthdateSupported ? (
                      <div style={{ marginTop: 12 }}>
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Date de naissance
                        </label>
                        <input
                          value={birthdate}
                          onChange={(e) => setBirthdate(e.target.value)}
                          placeholder="AAAA-MM-JJ"
                          style={fieldStyle}
                        />
                      </div>
                    ) : null}
                  </section>

                  <section>
                    <p style={{ fontWeight: 800, margin: "0 0 10px", fontSize: 15 }}>Contact</p>
                    <label
                      style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}
                    >
                      Téléphone
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={fieldStyle}
                    />
                  </section>

                  <section>
                    <p style={{ fontWeight: 800, margin: "0 0 10px", fontSize: 15 }}>Adresse</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Rue et numéro
                        </label>
                        <input
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Complément
                        </label>
                        <input
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            Code postal
                          </label>
                          <input
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            style={fieldStyle}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            Ville
                          </label>
                          <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            style={fieldStyle}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            Pays
                          </label>
                          <input
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            style={fieldStyle}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {message ? (
                    <p role="status" style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                      {message}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    style={{
                      padding: "14px 16px",
                      borderRadius: PAIPERS_RADIUS.button,
                      border: "none",
                      background: PAIPERS_COLORS.navy,
                      color: "#fff",
                      fontWeight: 800,
                      cursor: saving ? "wait" : "pointer",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </AppShell>
    </Protected>
  );
}
